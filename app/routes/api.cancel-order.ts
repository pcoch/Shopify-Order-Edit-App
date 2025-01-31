import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate, unauthenticated } from "../shopify.server";
import { json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  try {
    //Handle auth customer account request
    const { sessionToken } = await authenticate.public.customerAccount(request);
    const shop = sessionToken.dest; //this is passed to the unauthenticated admin api

    //Pull out data from request
    const body = await request.json();
    const { orderId } = body;

    // Handle auth admin api
    const { admin } = await unauthenticated.admin(shop);

    // Make the request to Shopify Admin API
    const response = await admin.graphql(
      `mutation cancelOrder($orderId: ID!) {
        orderCancel(
          orderId: $orderId,
          notifyCustomer: true,
          reason: CUSTOMER,
          refund: true,
          restock: true
        ) {
          job {
            id
          }
          orderCancelUserErrors {
            code
            field
            message
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

    return json({
      success: true,
      data: responseJson,
    });
  } catch (error) {
    console.error("🔴server error:", error);
    return json({
      error: error instanceof Error ? error.message : "Server error occurred",
    });
  }
}
