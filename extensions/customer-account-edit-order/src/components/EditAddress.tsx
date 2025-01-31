import {
  Disclosure,
  Pressable,
  Button,
  InlineLayout,
  Form,
  Grid,
  TextField,
  GridItem,
  BlockSpacer,
  View,
  Icon,
  Text,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";
import { useState } from "react";

import * as countries from "i18n-iso-countries";
const en = require("i18n-iso-countries/langs/en.json");
countries.registerLocale(en);

//TODO: Add edit address form
//TODO: Add edit address form validation
//TODO: Add edit address form submission
//TODO: Create API route to update address and return shipping rate if needed

export default function EditAddress({ sessionToken, orderId }) {
  const api = useApi();
  const shippingAddress = api.shippingAddress.current;

  const country = countries.getName(shippingAddress.countryCode, "en");

  const [address, setAddress] = useState(shippingAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  //Pass the address to the API
  const handleEditAddress = async () => {
    try {
      setIsLoading(true);
      setIsSuccess(false);
      const token = await sessionToken.get();
      const requestBody = {
        address: address,
        orderId: orderId,
      };
      const requestPayload = JSON.stringify(requestBody);

      const response = await fetch(
        "https://generations-income-boring-argued.trycloudflare.com/api/edit-address", //TODO: Change to production URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: requestPayload,
        },
      );
      const { success } = await response.json();

      if (success) {
        setIsLoading(false);
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Error details:", error);
      setIsLoading(false);
    }
  };

  return (
    <Disclosure>
      <Pressable border={["none", "none", "base", "none"]} toggles="one">
        <InlineLayout columns={["auto", "fill", "auto"]}>
          <View padding="base">
            <Icon source="delivered" />
          </View>
          <View padding="base">
            <Text emphasis="bold">Edit your shipping address</Text>
          </View>
          <View padding="base">
            <Icon source="chevronDown" />
          </View>
        </InlineLayout>
      </Pressable>
      <View padding="base" id="one">
        <Form onSubmit={handleEditAddress}>
          <Grid columns={["50%", "50%"]} spacing="base">
            <GridItem columnSpan={2}>
              <TextField readonly label="Country" value={country} />
            </GridItem>
            <View>
              <TextField
                autocomplete
                required
                label="First name"
                value={address.firstName}
                onChange={(value) =>
                  setAddress({ ...address, firstName: value })
                }
              />
            </View>
            <View>
              <TextField
                autocomplete
                required
                label="Last name"
                value={address.lastName}
                onChange={(value) =>
                  setAddress({ ...address, lastName: value })
                }
              />
            </View>
            <GridItem columnSpan={2}>
              <TextField
                autocomplete
                required
                label="Address"
                value={address.address1}
                onChange={(value) =>
                  setAddress({ ...address, address1: value })
                }
              />
            </GridItem>
            <GridItem columnSpan={2}>
              <TextField
                autocomplete
                label="Apartment, suite, etc"
                value={address.address2}
                onChange={(value) =>
                  setAddress({ ...address, address2: value })
                }
              />
            </GridItem>
            <GridItem columnSpan={2}>
              <Grid columns={["33%", "33%", "33%"]} spacing="base">
                <View>
                  <TextField
                    label="City"
                    required
                    value={address.city}
                    onChange={(value) =>
                      setAddress({ ...address, city: value })
                    }
                  />
                </View>
                <View>
                  <TextField
                    label="State"
                    required
                    value={address.provinceCode}
                    onChange={(value) =>
                      setAddress({ ...address, provinceCode: value })
                    }
                  />
                </View>
                <View>
                  <TextField
                    required
                    error={address.zip ? "" : "Zip code is required"}
                    label="Zip"
                    value={address.zip}
                    onChange={(value) => setAddress({ ...address, zip: value })}
                  />
                </View>
              </Grid>
            </GridItem>
          </Grid>
          <BlockSpacer spacing="base" />
          <BlockSpacer spacing="base" />
          <View maxInlineSize={162} blockAlignment="center" padding="none">
            <Button loading={isLoading} accessibilityRole="submit">
              {isSuccess ? "Address updated" : "Update address"}
            </Button>
          </View>
        </Form>
      </View>
    </Disclosure>
  );
}
