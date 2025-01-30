import {
  Pressable,
  InlineLayout,
  Icon,
  Banner,
  reactExtension,
  useApi,
  View,
  Disclosure,
  useOrder,
  Text,
  useSessionToken,
  Progress,
  BlockStack,
} from "@shopify/ui-extensions-react/customer-account";
import { useState, useEffect } from "react";
import CancelOrder from "./components/cancelOrder";
import { useOrderCancel } from "./hooks/useOrderCancel";

export default reactExtension(
  "customer-account.order-status.block.render",
  () => <OrderEditBlock />,
);

function OrderEditBlock() {
  //API variables
  const sessionToken = useSessionToken();
  const { id, cancelledAt, processedAt } = useOrder();
  const { navigation } = useApi();

  const { handleCancel, cancelStatus } = useOrderCancel({
    sessionToken,
    orderId: id,
    navigation,
  });

  //Handle 30 minute edit window
  const [timeLeft, setTimeLeft] = useState(() => {
    const processedTime = new Date(processedAt).getTime();
    const thirtyMinsInMs = 30 * 60 * 1000;
    const expiryTime = processedTime + thirtyMinsInMs;
    const remainingMs = expiryTime - Date.now();

    if (remainingMs <= 0) {
      return "00:00";
    }

    const minutes = Math.floor(remainingMs / (60 * 1000));
    const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        const [mins, secs] = prevTimeLeft.split(":").map(Number);
        const totalSeconds = mins * 60 + secs - 1;

        if (totalSeconds <= 0) {
          clearInterval(interval);
          return "00:00";
        }

        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;

        return `${newMinutes.toString().padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    !cancelledAt && (
      <BlockStack>
        {timeLeft !== "00:00" ? (
          <>
            <Banner title="Need to edit your order?">
              <View padding={["base", "none", "base", "none"]}>
                <Text>Time Left To Edit: {timeLeft}</Text>
              </View>
              <Progress
                tone="auto"
                value={(() => {
                  const [mins, secs] = timeLeft.split(":").map(Number);
                  const timeLeftSeconds = mins * 60 + secs;
                  return 30 * 60 - timeLeftSeconds;
                })()}
                max={30 * 60}
              />
            </Banner>

            <CancelOrder onCancel={handleCancel} cancelStatus={cancelStatus} />
            <Disclosure>
              <Pressable
                border={["none", "none", "base", "none"]}
                toggles="one"
              >
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
                Content
              </View>
            </Disclosure>

            <Disclosure>
              <Pressable
                border={["none", "none", "base", "none"]}
                toggles="one"
              >
                <InlineLayout columns={["auto", "fill", "auto"]}>
                  <View padding="base">
                    <Icon source="reorder" />
                  </View>
                  <View padding="base">
                    <Text emphasis="bold">Change product size</Text>
                  </View>
                  <View padding="base">
                    <Icon source="chevronDown" />
                  </View>
                </InlineLayout>
              </Pressable>
              <View padding="base" id="one">
                Content
              </View>
            </Disclosure>
          </>
        ) : (
          <Banner status="info">
            The time window to edit this order has expired.
          </Banner>
        )}
      </BlockStack>
    )
  );
}

// //Handle cancel order
// const handleCancelOrder = async (): Promise<void> => {
//   try {
//     const token: string = await sessionToken.get();
//     const requestBody = {
//       orderId: id,
//     };
//     const requestPayload = JSON.stringify(requestBody);
//     const response: Response = await fetch(
//       "https://spies-cottage-centres-avenue.trycloudflare.com/api/cancel-order",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//           Accept: "application/json",
//         },
//         body: requestPayload,
//       },
//     );
//     const { success, data } = await response.json();

//     if (success && data.data.orderCancel) {
//       const { orderCancelUserErrors, userErrors } = data.data.orderCancel;

//       if (orderCancelUserErrors.length === 0 && userErrors.length === 0) {
//         setCancelStatus({ success: true });
//         setTimeout(() => {
//           navigation.navigate("shopify:customer-account/orders");
//         }, 1500);
//       } else {
//         const errorMessage =
//           orderCancelUserErrors[0]?.message ||
//           userErrors[0]?.message ||
//           "Cancellation failed";
//         setCancelStatus({ success: false, error: errorMessage });
//       }
//     }
//   } catch (error) {
//     console.error("Error details:", error);
//     setCancelStatus({
//       success: false,
//       error: error instanceof Error ? error.message : "An error occurred",
//     });
//   }
// };
