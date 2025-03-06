import {
  Button,
  Form,
  Grid,
  TextField,
  Banner,
  GridItem,
  BlockSpacer,
  View,
  Modal,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";
import { useState } from "react";

import * as countries from "i18n-iso-countries";
const en = require("i18n-iso-countries/langs/en.json");
countries.registerLocale(en);

export default function EditAddress({ sessionToken, orderId }) {
  const api = useApi();
  const shippingAddress = api.shippingAddress.current;

  const country = countries.getName(shippingAddress.countryCode, "en");

  const [address, setAddress] = useState(shippingAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState();

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
        "https://ranking-mexico-trailer-station.trycloudflare.com/api/edit-address", //TODO: Change to production URL
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
      const { success, data } = await response.json();

      const errors = data.data.orderUpdate.userErrors;
      console.log("User Errors:", JSON.stringify(errors));

      if (success && errors.length === 0) {
        setErrors(null);
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      } else if (success && errors.length > 0) {
        setErrors(errors[0].message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error details:", error);
      setIsLoading(false);
    }
  };

  // Validation function to check for errors
  const hasValidationErrors = () => {
    return (
      !address.firstName ||
      !address.lastName ||
      !address.address1 ||
      !address.city ||
      !address.provinceCode ||
      !address.zip
    );
  };

  return (
    <Modal title="Edit address">
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
                error={address.firstName ? "" : "First name is required"}
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
                error={address.lastName ? "" : "Last name is required"}
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
                error={address.address1 ? "" : "Address is required"}
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
                    error={address.city ? "" : "City is required"}
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
                    error={address.provinceCode ? "" : "State is required"}
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
          {errors && (
            <View>
              <Banner
                title="There was an issue updating your address"
                status="critical"
              >
                {errors}
              </Banner>
              <BlockSpacer spacing="base" />
            </View>
          )}
          <View maxInlineSize={162} blockAlignment="center" padding="none">
            <Button
              loading={isLoading}
              accessibilityRole="submit"
              disabled={hasValidationErrors()}
            >
              {isSuccess ? "Address updated!" : "Update address"}
            </Button>
          </View>
        </Form>
      </View>
    </Modal>
  );
}
