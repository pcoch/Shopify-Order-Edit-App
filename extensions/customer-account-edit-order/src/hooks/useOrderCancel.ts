import { useState } from "react";
import type {
  useApi,
  useSessionToken,
} from "@shopify/ui-extensions-react/customer-account";

// Input props type
interface UseOrderCancelProps {
  sessionToken: ReturnType<typeof useSessionToken>;
  orderId: string;
  navigation: ReturnType<typeof useApi>["navigation"];
}

// Status type
interface CancelStatus {
  success?: boolean;
  error?: string;
}

// Return type for our hook
interface UseOrderCancelReturn {
  handleCancel: () => Promise<void>;
  cancelStatus: CancelStatus;
}

export const useOrderCancel = ({
  sessionToken,
  orderId,
  navigation,
}: UseOrderCancelProps): UseOrderCancelReturn => {
  const [cancelStatus, setCancelStatus] = useState<CancelStatus>({});

  const handleCancel = async () => {
    try {
      const token = await sessionToken.get();
      const requestBody = {
        orderId: orderId,
      };
      const requestPayload = JSON.stringify(requestBody);
      const response = await fetch(
        "https://plant-talks-highly-selective.trycloudflare.com/api/cancel-order",
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
          setTimeout(() => {
            navigation.navigate("shopify:customer-account/orders");
          }, 1500);
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
    }
  };

  return {
    handleCancel,
    cancelStatus,
  };
};
