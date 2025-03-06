import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate, unauthenticated } from "../shopify.server";
import { json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  try {
    //Handle auth customer account request
    const { sessionToken } = await authenticate.public.customerAccount(request);
    const shop = sessionToken.dest;

    //Pull out data from request
    const body = await request.json();
    const { orderId } = body;

    // Handle auth admin api
    const { admin } = await unauthenticated.admin(shop);

    // Make the request to Shopify Admin API to begin order edit
    const response = await admin.graphql(
      `mutation beginEdit($orderId: ID!) {
        orderEditBegin(id: $orderId) {
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
            addedLineItems(first: 50) {
              edges {
                node {
                  id
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
          orderId: orderId,
        },
      },
    );

    const responseJson = await response.json();

    const userErrors = responseJson.data?.orderEditBegin?.userErrors;
    if (userErrors && userErrors.length > 0) {
      return json({
        success: false,
        errors: userErrors,
      });
    }

    return json({
      success: true,
      data: responseJson,
    });
  } catch (error) {
    console.error("🔴server error:", error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Server error occurred",
    });
  }
}
