import {
  BlockStack,
  InlineLayout,
  ProductThumbnail,
  Stepper,
  Button,
  Banner,
  Modal,
  View,
  Text,
  useApi,
  useSessionToken,
} from "@shopify/ui-extensions-react/customer-account";
import { useState } from "react";

export default function EditQuantity({
  line,
  calculatedOrder,
  setCalculatedOrder,
  isLoading,
  setIsLoading,
}) {
  //State for modal quantity
  const [modalQuantity, setModalQuantity] = useState(line.quantity);

  //API variables
  const { ui } = useApi();
  const sessionToken = useSessionToken();

  const handleQuantityUpdate = async () => {
    setIsLoading(true);
    try {
      const token = await sessionToken.get();
      const response = await fetch(
        "https://calendar-boulder-interested-it.trycloudflare.com/api/edit-quantity",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            calculatedOrderId: calculatedOrder.id,
            lineItemId: line.id,
            quantity: modalQuantity,
            restock: modalQuantity < line.quantity,
          }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.errors?.[0]?.message ||
            data.error ||
            "Failed to update quantity",
        );
      }

      if (data.success) {
        setCalculatedOrder(data.data.orderEditSetQuantity.calculatedOrder);
        setIsLoading(false);
        ui.overlay.close("edit-quantity-modal");
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      setIsLoading(false);
      ui.overlay.close("edit-quantity-modal");
      return;
    }
  };

  return (
    <Modal id="edit-quantity-modal">
      <View padding="loose" id="quantities">
        <View
          key={line.id}
          border="none"
          padding={["none", "none", "loose", "none"]}
        >
          <InlineLayout
            columns={["auto", "fill"]}
            padding={["none", "none", "base", "none"]}
            blockAlignment="center"
          >
            {line.image && (
              <ProductThumbnail
                source={line.image.url}
                alt={line.title}
                size="base"
                badge={modalQuantity}
              />
            )}
            <BlockStack
              padding={["none", "none", "none", "base"]}
              spacing="extraTight"
            >
              <Text>{line.title}</Text>
              <Text appearance="subdued">
                ${line.originalUnitPriceSet?.presentmentMoney?.amount}/ea
              </Text>
            </BlockStack>
          </InlineLayout>
          <InlineLayout
            maxInlineSize={260}
            padding={["none", "none", "extraTight", "none"]}
          >
            <Stepper
              label="Quantity"
              value={modalQuantity}
              min={0}
              max={line.variant?.inventoryQuantity || 0}
              step={1}
              onChange={(value) => {
                setModalQuantity(value);
              }}
            />
          </InlineLayout>
          {line.variant?.inventoryQuantity === 0 && (
            <Text appearance="subdued">Currently unavailable</Text>
          )}{" "}
        </View>
        <Button
          loading={isLoading}
          kind="primary"
          onPress={handleQuantityUpdate}
        >
          Done
        </Button>
      </View>
    </Modal>
  );
}
