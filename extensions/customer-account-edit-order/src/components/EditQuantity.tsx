import {
  Disclosure,
  BlockStack,
  Pressable,
  InlineLayout,
  ProductThumbnail,
  Banner,
  Stepper,
  Button,
  View,
  Icon,
  Text,
  useCartLines,
} from "@shopify/ui-extensions-react/customer-account";
import { useState, useEffect } from "react";

export default function EditQuantity({ sessionToken, orderId }) {
  const [quantities, setQuantities] = useState({});

  const lines = useCartLines();

  useEffect(() => {
    const initialQuantities = {};
    const initialVariants = {};

    lines.forEach((line) => {
      initialQuantities[line.id] = line.quantity;
      initialVariants[line.id] = line.merchandise.id;
    });
    setQuantities(initialQuantities);
  }, [lines]);

  return (
    <BlockStack spacing="base">
      <Disclosure>
        <Pressable
          border={["none", "none", "base", "none"]}
          toggles="quantities"
        >
          <InlineLayout columns={["auto", "fill", "auto"]}>
            <View padding="base">
              <Icon source="pen" />
            </View>
            <View padding="base">
              <Text emphasis="bold">Change quantity</Text>
            </View>
            <View padding="base">
              <Icon source="chevronDown" />
            </View>
          </InlineLayout>
        </Pressable>
        <View padding="base" id="quantities">
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
          <Banner>You will be charged for the new quantity.</Banner>
          <Button>Apply changes</Button>
        </View>
      </Disclosure>
    </BlockStack>
  );
}
