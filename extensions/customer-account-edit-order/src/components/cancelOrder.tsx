import {
  Disclosure,
  Pressable,
  Button,
  InlineLayout,
  BlockSpacer,
  View,
  Icon,
  Text,
  Banner,
} from "@shopify/ui-extensions-react/customer-account";
import { useState } from "react";

export default function CancelOrder({ sessionToken, orderId, navigation }) {
  const [cancelStatus, setCancelStatus] = useState<{
    success?: boolean;
    error?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      const token = await sessionToken.get();
      const requestBody = {
        orderId: orderId,
      };
      const requestPayload = JSON.stringify(requestBody);
      const response = await fetch(
        "https://interesting-occur-slots-pubs.trycloudflare.com/api/cancel-order", //TODO: Change to production URL
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

      if (success && data.data.orderCancel) {
        const { orderCancelUserErrors, userErrors } = data.data.orderCancel;

        if (orderCancelUserErrors.length === 0 && userErrors.length === 0) {
          setCancelStatus({ success: true });
        } else {
          const errorMessage =
            orderCancelUserErrors[0]?.message ||
            userErrors[0]?.message ||
            "Cancellation failed";
          setCancelStatus({ success: false, error: errorMessage });
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      setCancelStatus({
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate("shopify:customer-account/orders");
      }, 1500);
    }
  };

  return (
    <Disclosure>
      <Pressable
        border={["none", "none", "base", "none"]}
        toggles="cancel-section"
      >
        <InlineLayout columns={["auto", "fill", "auto"]}>
          <View padding="base">
            <Icon source="error" />
          </View>
          <View padding="base">
            <Text emphasis="bold">Cancel your order</Text>
          </View>
          <View padding="base">
            <Icon source="chevronDown" />
          </View>
        </InlineLayout>
      </Pressable>
      <View id="cancel-section">
        <Banner
          title="Are you sure you want to cancel your order?"
          status="warning"
        >
          <Text>
            You will recieve an email confirmation and a refund will be issued
            to your original payment method.
          </Text>
        </Banner>
        <BlockSpacer spacing="base"></BlockSpacer>
        <Button
          loading={isLoading}
          onPress={handleCancel}
          loadingLabel="Cancelling order..."
        >
          Cancel order
        </Button>
        <BlockSpacer spacing="base"></BlockSpacer>
        {cancelStatus.error && (
          <Banner
            title="There was an error cancelling your order. "
            status="critical"
          >
            Please contact support.
          </Banner>
        )}
      </View>
    </Disclosure>
  );
}
