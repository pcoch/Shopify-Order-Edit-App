import {
  Banner,
  reactExtension,
  TextBlock,
  Card,
  View,
  useOrder,
  Text,
  InlineLayout,
  Divider,
  useSessionToken,
  BlockStack,
  Page,
  Button,
  Menu,
  useApi,
  Heading,
} from "@shopify/ui-extensions-react/customer-account";
import { useState, useEffect } from "react";
import ProductList from "./components/ProductList";
import EditAddress from "./components/ModalEditAddress";
import CancelOrder from "./components/ModalCancel";
import RecommendedProducts from "./components/RecommendedProducts";

export default reactExtension("customer-account.order.page.render", () => (
  <FullPageExtension />
));

function FullPageExtension() {
  //API variables
  const sessionToken = useSessionToken();
  const { id, name, cancelledAt, processedAt } = useOrder();
  const { i18n, navigation } = useApi();

  //Top level state
  const [updatedTotal, setUpdatedTotal] = useState(0);
  const [amountToPay, setAmountToPay] = useState(0);
  const [alreadyPaid, setAlreadyPaid] = useState(0);
  const [calculatedOrder, setCalculatedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); //If order is being edited

  //Handle 30 minute edit window
  const [timeLeft, setTimeLeft] = useState(() => {
    const processedTime = new Date(processedAt).getTime();
    const thirtyMinsInMs = 60 * 60 * 1000; //Update this for edit window
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

  //Call beginEdit on mount to get calculated order data
  useEffect(() => {
    if (!cancelledAt && timeLeft !== "00:00") {
      beginEdit();
    }
  }, []);

  const beginEdit = async () => {
    try {
      const token = await sessionToken.get();

      const beginEditResponse = await fetch(
        "https://include-objective-homework-truly.trycloudflare.com/api/begin-edit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            orderId: id,
          }),
        },
      );

      const beginEditData = await beginEditResponse.json();

      const userErrors = beginEditData.data?.data?.orderEditBegin?.userErrors;
      if (userErrors && userErrors.length > 0) {
        throw new Error(userErrors[0].message);
      }

      if (
        !beginEditData.success ||
        !beginEditData.data?.data?.orderEditBegin?.calculatedOrder
      ) {
        throw new Error("Invalid response format from server");
      }

      const calculatedOrderData =
        beginEditData.data.data.orderEditBegin.calculatedOrder;
      setCalculatedOrder(calculatedOrderData);

      return calculatedOrderData.id;
    } catch (error) {
      console.error("Failed to begin order edit:", error);
      return null;
    }
  };

  //Handle commitEdit on 'Update Order' press
  const handleCommitEdit = async () => {
    try {
      setIsLoading(true);
      const token = await sessionToken.get();

      const commitEditResponse = await fetch(
        "https://include-objective-homework-truly.trycloudflare.com/api/commit-edit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            calculatedOrderId: calculatedOrder.id,
          }),
        },
      );

      const commitEditData = await commitEditResponse.json();

      if (!commitEditData.success) {
        throw new Error("Failed to commit order edit");
      }

      if (commitEditData.success) {
        setIsLoading(false);
        const numericId = id.split("/").pop();
        navigation.navigate(`shopify:customer-account/orders/${numericId}`);
      }
    } catch (error) {
      console.error("Failed to commit order edit:", error);
      setIsLoading(false);
    }
  };

  // Update states when calculatedOrder changes
  useEffect(() => {
    if (calculatedOrder) {
      setUpdatedTotal(
        parseFloat(calculatedOrder.totalPriceSet.presentmentMoney.amount),
      );
      setAmountToPay(
        parseFloat(calculatedOrder.totalOutstandingSet.presentmentMoney.amount),
      );
      setAlreadyPaid(
        parseFloat(
          calculatedOrder.originalOrder.totalReceivedSet.presentmentMoney
            .amount,
        ),
      );
      const hasStagedChanges = calculatedOrder.stagedChanges.edges.length > 0;
      setIsEditing(hasStagedChanges);
    }
  }, [calculatedOrder]);

  useEffect(() => {
    console.log("Calculated Order:", calculatedOrder);
  }, [calculatedOrder]);

  return (
    <Page
      title={`Edit Order ${name}`}
      subtitle={`Time remaining: ${timeLeft}`}
      primaryAction={
        timeLeft !== "00:00" ? (
          <Button
            overlay={
              <Menu>
                <Button
                  overlay={
                    <EditAddress
                      sessionToken={sessionToken}
                      orderId={id}
                    ></EditAddress>
                  }
                >
                  Edit shipping address
                </Button>
                <Button
                  appearance="critical"
                  overlay={
                    <CancelOrder
                      sessionToken={sessionToken}
                      orderId={id}
                      navigation={navigation}
                    ></CancelOrder>
                  }
                >
                  Cancel order
                </Button>
              </Menu>
            }
          >
            Manage
          </Button>
        ) : undefined
      }
    >
      <BlockStack maxInlineSize={705} spacing="base">
        {timeLeft !== "00:00" ? (
          <>
            <Card padding>
              <ProductList
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                calculatedOrder={calculatedOrder}
                setCalculatedOrder={setCalculatedOrder}
              ></ProductList>
            </Card>
            <Card padding>
              <RecommendedProducts
                setIsLoading={setIsLoading}
                calculatedOrder={calculatedOrder}
                setCalculatedOrder={setCalculatedOrder}
              ></RecommendedProducts>
            </Card>
            <View cornerRadius="large" minInlineSize="fill">
              <Card padding>
                <BlockStack spacing="base">
                  <Heading level={3}>Summary</Heading>

                  {calculatedOrder && (
                    <>
                      <InlineLayout
                        columns={["auto", "fill", "auto"]}
                        spacing="base"
                      >
                        <Text>Updated total</Text>
                        <View />
                        <Text>{i18n.formatCurrency(updatedTotal)}</Text>
                      </InlineLayout>
                      <InlineLayout
                        columns={["auto", "fill", "auto"]}
                        spacing="base"
                      >
                        <Text>Already paid</Text>
                        <View />
                        <Text>{i18n.formatCurrency(alreadyPaid)}</Text>
                      </InlineLayout>
                      <Divider></Divider>
                      <InlineLayout
                        columns={["auto", "fill", "auto"]}
                        spacing="base"
                      >
                        <Text emphasis="bold">Amount to pay</Text>
                        <View />
                        <Text emphasis="bold">
                          {i18n.formatCurrency(amountToPay)}
                        </Text>
                      </InlineLayout>
                    </>
                  )}
                  {amountToPay < 0 && (
                    <Banner>
                      You'll recieve a refund to your payment method.
                    </Banner>
                  )}
                  {amountToPay > 0 && (
                    <Banner>
                      You'll be redirected to pay your outstanding balance.
                    </Banner>
                  )}
                  <Button
                    loading={isLoading}
                    disabled={!isEditing}
                    kind="primary"
                    onPress={handleCommitEdit}
                  >
                    Update Order
                  </Button>
                </BlockStack>
              </Card>
            </View>
          </>
        ) : (
          <View maxInlineSize={620}>
            <Banner
              title={`Your order can no longer be edited.`}
              status="warning"
            >
              <TextBlock>
                The time window to edit this order has expired. Please contact
                support if you need help with your order.
              </TextBlock>
            </Banner>
          </View>
        )}
      </BlockStack>
    </Page>
  );
}
