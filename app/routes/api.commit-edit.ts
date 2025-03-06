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
    const { calculatedOrderId } = body;

    if (!calculatedOrderId) {
      return json(
        {
          success: false,
          error: "Missing calculatedOrderId",
        },
        { status: 400 },
      );
    }

    // Handle auth admin api
    const { admin } = await unauthenticated.admin(shop);

    // Make the request to Shopify Admin API to commit order edit
    const response = await admin.graphql(
      `mutation commitEdit($id: ID!) {
        orderEditCommit(id: $id, notifyCustomer: true) {
          order {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          id: calculatedOrderId,
        },
      },
    );

    const responseJson = await response.json();

    const userErrors = responseJson.data?.orderEditCommit?.userErrors;

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
