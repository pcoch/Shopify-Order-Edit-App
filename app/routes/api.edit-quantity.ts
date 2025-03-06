import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate, unauthenticated } from "../shopify.server";
import { json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Handle auth customer account request
    const { sessionToken } = await authenticate.public.customerAccount(request);
    const shop = sessionToken.dest;

    // Pull out data from request
    const body = await request.json();
    const { calculatedOrderId, lineItemId, quantity, restock = true } = body;

    if (!calculatedOrderId || !lineItemId || quantity === undefined) {
      return json(
        {
          success: false,
          error: "Missing required parameters",
        },
        { status: 400 },
      );
    }

    // Handle auth admin api
    const { admin } = await unauthenticated.admin(shop);

    // Make the request to Shopify Admin API to edit line item quantity
    const response = await admin.graphql(
      `mutation editQuantity($calculatedOrderId: ID!, $lineItemId: ID!, $quantity: Int!, $restock: Boolean) {
        orderEditSetQuantity(
          id: $calculatedOrderId, 
          lineItemId: $lineItemId, 
          quantity: $quantity,
          restock: $restock
        ) {
          calculatedOrder {
            id
            originalOrder {
            totalReceivedSet {
              presentmentMoney {
                amount
                currencyCode
              }
            }
          }
            totalPriceSet {
              presentmentMoney {
                amount
                currencyCode
              }
            }
            totalOutstandingSet {
              presentmentMoney {
                amount
                currencyCode
              }
            }
            lineItems(first: 50) {
              edges {
                node {
                  id
                  quantity
                  originalUnitPriceSet {
                    presentmentMoney {
                      amount
                      currencyCode
                    }
                  }
                  title
                  image {
                    url
                  }
                  variant {
                    id
                    inventoryQuantity
                    title
                  }
                }
              }
            }
            addedLineItems(first: 50) {
              edges {
                node {
                  id
                }
              }
            }
            stagedChanges(first: 10) {
          edges {
            node {
              ... on OrderStagedChangeDecrementItem {
                delta
              }
              ... on OrderStagedChangeIncrementItem {
                delta
              }
            }
          }
        }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          calculatedOrderId,
          lineItemId,
          quantity,
          restock,
        },
      },
    );

    const responseJson = await response.json();

    // Check for user errors
    const userErrors = responseJson.data?.orderEditSetQuantity?.userErrors;
    if (userErrors && userErrors.length > 0) {
      return json({
        success: false,
        errors: userErrors,
      });
    }

    return json({
      success: true,
      data: responseJson.data,
    });
  } catch (error) {
    console.error("🔴 Server error:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Server error occurred",
      },
      { status: 500 },
    );
  }
}
