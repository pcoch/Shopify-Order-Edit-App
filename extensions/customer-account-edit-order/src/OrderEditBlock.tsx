//TODO: Legacy - we'll remove this once the new edit order page is fully implemented

import {
  Banner,
  reactExtension,
  useApi,
  View,
  useOrder,
  Text,
  useSessionToken,
  Progress,
  BlockStack,
} from "@shopify/ui-extensions-react/customer-account";
import { useState, useEffect } from "react";
import CancelOrder from "./components/CancelOrder";
import EditAddress from "./components/EditAddress";
import EditQuantity from "./components/EditQuantity";

export default reactExtension(
  "customer-account.order-status.block.render",
  () => <OrderEditBlock />,
);

function OrderEditBlock() {
  //API variables
  const sessionToken = useSessionToken();
  const { id, cancelledAt, processedAt } = useOrder();
  const { navigation } = useApi();

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
                <Text>Time remaining: {timeLeft}</Text>
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

            <CancelOrder
              sessionToken={sessionToken}
              orderId={id}
              navigation={navigation}
            ></CancelOrder>

            <EditAddress sessionToken={sessionToken} orderId={id}></EditAddress>

            <EditQuantity
              sessionToken={sessionToken}
              orderId={id}
            ></EditQuantity>
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
