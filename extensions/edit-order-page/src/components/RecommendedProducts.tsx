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
  useSessionToken,
} from "@shopify/ui-extensions-react/customer-account";
import { useEffect, useState } from "react";

//TODO: Add a button to remove the item from the order

export default function RecommendedProducts({
  calculatedOrder,
  setCalculatedOrder,
  setIsLoading,
}) {
  const [lines, setLines] = useState([]); // For recommended product lines
  const [loadingVariantId, setLoadingVariantId] = useState(null); // Track which variant is being added
  const { i18n, query } = useApi();
  const sessionToken = useSessionToken();

  //Handle add item
  const handleAddItem = async (variantId: string) => {
    setLoadingVariantId(variantId);
    setIsLoading(true);
    try {
      const token = await sessionToken.get();
      const response = await fetch(
        "https://include-objective-homework-truly.trycloudflare.com/api/add-item",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            calculatedOrderId: calculatedOrder.id,
            lineItemId: variantId,
            quantity: 1,
          }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.errors?.[0]?.message || data.error || "Failed to add item",
        );
      }

      if (data.success) {
        setCalculatedOrder(data.data.orderEditAddVariant.calculatedOrder);
      }
    } catch (error) {
      console.error("Failed to add item:", error);
    } finally {
      setLoadingVariantId(null);
      setIsLoading(false);
    }
  };

  //Fetch recommended products
  const RECOMMENDED_PRODUCTS_QUERY = `
  query getRecommendedProducts($productId: ID!) {
    productRecommendations(productId: $productId, intent: RELATED) {
      id
      title
      variants(first: 1) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
              image {
              url
              altText
              }
          }
        }
      }
    }
  }
`;

  const getProductIds = (calculatedOrder: any) => {
    if (!calculatedOrder || !calculatedOrder.lineItems?.edges) {
      return [];
    }

    return calculatedOrder.lineItems.edges
      .filter((edge) => edge?.node?.variant?.product)
      .map((edge) => edge.node.variant.product.id);
  };

  const processRecommendations = (recommendationsArray, calculatedOrder) => {
    if (!calculatedOrder?.lineItems?.edges) {
      console.log("Missing line items in calculated order:", calculatedOrder);
      return [];
    }

    const existingProductIds = new Set(
      calculatedOrder.lineItems.edges
        .filter((edge) => edge?.node?.variant?.product)
        .map((edge) => edge.node.variant.product.id),
    );

    const flattenedProducts = recommendationsArray
      .flatMap((result) => result.data?.productRecommendations || [])
      .filter(
        (product, index, self) =>
          product &&
          index === self.findIndex((p) => p.id === product.id) &&
          !existingProductIds.has(product.id),
      )
      .slice(0, 3);
    return flattenedProducts;
  };

  const fetchRecommendations = async () => {
    try {
      const productIds = getProductIds(calculatedOrder);

      if (productIds.length === 0) {
        return;
      }

      const recommendations = await Promise.all(
        productIds.map((productId) =>
          query(RECOMMENDED_PRODUCTS_QUERY, { variables: { productId } }),
        ),
      );

      const processedRecommendations = processRecommendations(
        recommendations,
        calculatedOrder,
      );
      setLines(processedRecommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setLines([]);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [calculatedOrder]);

  const isProductInOrder = (variantId: string) => {
    const regularLineVariants =
      calculatedOrder?.lineItems?.edges?.map(
        (edge) => edge?.node?.variant?.id,
      ) || [];

    const addedLineVariants =
      calculatedOrder?.addedLineItems?.edges?.map(
        (edge) => edge?.node?.variant?.id,
      ) || [];

    const allVariants = [...regularLineVariants, ...addedLineVariants];
    return allVariants.includes(variantId);
  };

  if (!lines || lines.length === 0) {
    return (
      <BlockStack spacing="base" minInlineSize="fill">
        <SkeletonText inlineSize="small" />
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonImage key={index} inlineSize="fill" blockSize={80} />
        ))}
      </BlockStack>
    );
  }

  return (
    <BlockStack spacing="base" minInlineSize="fill">
      <Heading level={2}>You might also like</Heading>
      {lines.map((line) => {
        const variant = line.variants.edges[0].node;
        const isAdded = isProductInOrder(variant.id);
        return (
          <View key={line.id} padding="tight" cornerRadius="large">
            <BlockStack spacing="loose">
              <InlineLayout
                spacing="base"
                columns={[64, "fill", "auto"]}
                blockAlignment="center"
              >
                <ProductThumbnail
                  source={variant.image?.url}
                  alt={variant.image?.altText || "Product"}
                  size="base"
                />
                <BlockStack spacing="none">
                  <Text size="base" emphasis="bold">
                    {line.title}
                    {variant?.title !== "Default Title"
                      ? `: ${variant.title}`
                      : ""}
                  </Text>
                  <Text appearance="subdued">
                    {i18n.formatCurrency(parseFloat(variant.price.amount))}
                  </Text>
                </BlockStack>
                <Button
                  kind="secondary"
                  loading={loadingVariantId === variant.id}
                  disabled={isAdded}
                  accessibilityLabel={
                    isAdded ? "Product added" : `Add ${variant.title} to cart`
                  }
                  onPress={() => handleAddItem(variant.id)}
                >
                  {isAdded ? "Added" : "Add"}
                </Button>
              </InlineLayout>
            </BlockStack>
          </View>
        );
      })}
    </BlockStack>
  );
}
