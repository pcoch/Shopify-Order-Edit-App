import {
  BlockStack,
  InlineLayout,
  ProductThumbnail,
  Stepper,
  Button,
  Modal,
  View,
  useCartLines,
  Text,
} from "@shopify/ui-extensions-react/customer-account";

export default function EditQuantity({ sessionToken, orderId }) {
  const lines = useCartLines();

  return (
    <Modal>
      <View padding="loose" id="quantities">
        {lines?.map((line) => (
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
              {line.merchandise.image && (
                <ProductThumbnail
                  source={line.merchandise.image.url}
                  alt={line.merchandise.title}
                  size="base"
                  badge={quantities[line.id] ?? line.quantity}
                />
              )}
              <BlockStack
                padding={["none", "none", "none", "base"]}
                spacing="extraTight"
              >
                <Text>{line.merchandise.title}</Text>
                <Text appearance="subdued">
                  ${line.cost.totalAmount.amount / line.quantity}/ea
                </Text>
              </BlockStack>
            </InlineLayout>
            <InlineLayout maxInlineSize={260}>
              <Stepper
                label="New quantity"
                value={quantities[line.id] ?? line.quantity}
                min={0}
                max={100}
                step={1}
                onChange={(value) => {
                  setQuantities((prev) => ({
                    ...prev,
                    [line.id]: value,
                  }));
                }}
              />
            </InlineLayout>
          </View>
        ))}
        <Button>Apply changes</Button>
      </View>
    </Modal>
  );
}
