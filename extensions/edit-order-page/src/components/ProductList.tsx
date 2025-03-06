import {
  BlockStack,
  InlineLayout,
  ProductThumbnail,
  View,
  Heading,
  Text,
  useApi,
  Button,
  SkeletonText,
  SkeletonImage,
} from "@shopify/ui-extensions-react/customer-account";
import ModalEditQty from "./ModalEditQty";

interface LineItem {
  id: string;
  title: string;
  quantity: number;
  image?: {
    url: string;
  };
  variant?: {
    title: string;
    inventoryQuantity: number;
  };
  originalUnitPriceSet?: {
    presentmentMoney?: {
      amount: string;
    };
  };
}

export default function ProductList({
  calculatedOrder,
  setCalculatedOrder,
  isLoading,
  setIsLoading,
}) {
  // @ts-ignore
  const lineCount = useApi().lines.current.length; //used for skeleton loading count
  const lines =
    calculatedOrder?.lineItems?.edges?.map((edge) => edge?.node) || [];

  const { i18n } = useApi();

  // If no lines are available yet, show a loading state or placeholder
  if (!lines || lines.length === 0) {
    return (
      <BlockStack spacing="base" minInlineSize="fill">
        <SkeletonText inlineSize="small" />
        {Array.from({ length: lineCount }).map((_, index) => (
          <SkeletonImage key={index} inlineSize="fill" blockSize={80} />
        ))}
      </BlockStack>
    );
  }

  return (
    <BlockStack spacing="base" minInlineSize="fill">
      <Heading level={3}>Edit Products</Heading>
      {lines.map((line: LineItem) => {
        return (
          <View
            key={line.id}
            border="base"
            padding="tight"
            cornerRadius="large"
          >
            <InlineLayout
              columns={["auto", "fill"]}
              padding="tight"
              blockAlignment="center"
            >
              <ProductThumbnail
                source={line.image?.url}
                alt={line.title || "Product"}
                size="base"
                badge={line.quantity}
              />
              <BlockStack
                padding={["none", "none", "none", "base"]}
                spacing="extraTight"
              >
                <Text emphasis="bold">
                  {line.title} - {line?.variant?.title}
                </Text>
                <Text appearance="subdued">
                  {line.quantity} x{" "}
                  {i18n.formatCurrency(
                    parseFloat(
                      line.originalUnitPriceSet?.presentmentMoney?.amount,
                    ),
                  )}
                </Text>
                <InlineLayout
                  spacing="tight"
                  columns={["auto", "auto", "auto"]}
                >
                  <Button kind="plain">Apply discount</Button>
                  <Button
                    overlay={
                      <ModalEditQty
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        line={line}
                        calculatedOrder={calculatedOrder}
                        setCalculatedOrder={setCalculatedOrder}
                      />
                    }
                    kind="plain"
                  >
                    Adjust quantity
                  </Button>
                </InlineLayout>
              </BlockStack>
            </InlineLayout>
          </View>
        );
      })}
    </BlockStack>
  );
}
