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
    const { address, orderId } = body;

    // Handle auth admin api
    const { admin } = await unauthenticated.admin(shop);

    // Make the request to Shopify Admin API
    const response = await admin.graphql(
      `mutation orderUpdate($input: OrderInput!) {
          orderUpdate(input: $input) {
            order {
              id
              shippingAddress {
                address1
                address2
                city
                company
                countryCode
                firstName
                lastName
                phone
                provinceCode
                zip
                validationResultSummary
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
          input: {
            id: orderId,
            shippingAddress: {
              address1: address.address1,
              address2: address.address2,
              city: address.city,
              company: address.company,
              countryCode: address.countryCode,
              firstName: address.firstName,
              lastName: address.lastName,
              phone: address.phone,
              provinceCode: address.provinceCode,
              zip: address.zip,
            },
          },
        },
      },
    );

    console.log("Input variables:", {
      input: {
        id: orderId,
        shippingAddress: {
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          provinceCode: address.provinceCode,
          zip: address.zip,
          countryCode: address.countryCode,
          firstName: address.firstName || "",
          lastName: address.lastName || "",
          phone: address.phone || "",
        },
      },
    });

    console.log("Full response:", response);
    const responseJson = await response.json();
    console.log("Parsed response:", responseJson);

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
