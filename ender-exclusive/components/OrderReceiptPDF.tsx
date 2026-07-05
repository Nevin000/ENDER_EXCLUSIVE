// components/OrderReceiptPDF.tsx

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: "#ffffff",
    },
    // Header
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 15,
        borderBottom: "2px solid #e5e7eb",
    },
    logoSection: {
        flexDirection: "column",
    },
    logo: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a1a1a",
        letterSpacing: 3,
    },
    logoSub: {
        fontSize: 10,
        color: "#6b7280",
        letterSpacing: 5,
        marginTop: 2,
    },
    orderSection: {
        alignItems: "flex-end",
    },
    orderNumber: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#374151",
    },
    orderDate: {
        fontSize: 10,
        color: "#6b7280",
        marginTop: 2,
    },
    // Status
    statusContainer: {
        marginBottom: 15,
        padding: 8,
        borderRadius: 4,
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
    },
    statusText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#166534",
    },
    // Section
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 8,
        paddingBottom: 4,
        borderBottom: "1px solid #e5e7eb",
    },
    // Items Table
    tableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#f9fafb",
    },
    tableHeaderText: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#4b5563",
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
        paddingHorizontal: 4,
        borderBottom: "1px solid #f3f4f6",
    },
    tableRowLast: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
        paddingHorizontal: 4,
    },
    itemName: {
        fontSize: 9,
        color: "#1f2937",
        flex: 2,
    },
    itemQty: {
        fontSize: 9,
        color: "#6b7280",
        flex: 0.5,
        textAlign: "center",
    },
    itemPrice: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#1f2937",
        flex: 1,
        textAlign: "right",
    },
    // Totals
    totalsSection: {
        marginTop: 10,
        paddingTop: 10,
        borderTop: "1px solid #e5e7eb",
    },
    subtotalRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingVertical: 3,
    },
    subtotalLabel: {
        fontSize: 10,
        color: "#6b7280",
        marginRight: 20,
    },
    subtotalValue: {
        fontSize: 10,
        color: "#1f2937",
        width: 80,
        textAlign: "right",
    },
    deliveryRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingVertical: 3,
    },
    deliveryLabel: {
        fontSize: 10,
        color: "#6b7280",
        marginRight: 20,
    },
    deliveryValue: {
        fontSize: 10,
        color: "#1f2937",
        width: 80,
        textAlign: "right",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingVertical: 8,
        borderTop: "2px solid #e5e7eb",
        marginTop: 5,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1f2937",
        marginRight: 20,
    },
    totalValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#dc2626",
        width: 80,
        textAlign: "right",
    },
    // Grid
    gridTwo: {
        flexDirection: "row",
        gap: 20,
        marginTop: 5,
    },
    gridItem: {
        flex: 1,
    },
    // Address
    addressText: {
        fontSize: 9,
        color: "#374151",
        lineHeight: 1.8,
    },
    addressLabel: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#6b7280",
        marginBottom: 2,
    },
    // Payment
    paymentMethod: {
        fontSize: 9,
        color: "#1f2937",
    },
    paymentStatus: {
        fontSize: 8,
        color: "#6b7280",
        marginTop: 4,
    },
    // Footer
    footer: {
        position: "absolute",
        bottom: 35,
        left: 40,
        right: 40,
        borderTop: "1px solid #e5e7eb",
        paddingTop: 12,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: {
        fontSize: 7,
        color: "#9ca3af",
    },
});

interface OrderReceiptPDFProps {
    order: any;
    orderId: string;
}

export const OrderReceiptPDF = ({ order, orderId }: OrderReceiptPDFProps) => {
    const getStatusText = (status: string) => {
        switch (status) {
            case "pending": return "Order Received";
            case "processing": return "Processing";
            case "shipped": return "Shipped";
            case "delivered": return "Delivered";
            case "cancelled": return "Cancelled";
            default: return status || "Order Received";
        }
    };

    const getPaymentText = (method: string) => {
        return method === "cod" ? "Cash on Delivery" : "Bank Transfer";
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        <Text style={styles.logo}>ENDER</Text>
                        <Text style={styles.logoSub}>EXCLUSIVE</Text>
                    </View>
                    <View style={styles.orderSection}>
                        <Text style={styles.orderNumber}>#{orderId.slice(0, 8).toUpperCase()}</Text>
                        <Text style={styles.orderDate}>
                            {new Date(order.orderDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </Text>
                    </View>
                </View>

                {/* Status */}
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>✓ Status: {getStatusText(order.orderStatus)}</Text>
                </View>

                {/* Order Items - Table Style */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Items</Text>

                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, { flex: 2 }]}>Item</Text>
                        <Text style={[styles.tableHeaderText, { flex: 0.5, textAlign: "center" }]}>Qty</Text>
                        <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}>Price</Text>
                    </View>

                    {/* Table Rows */}
                    {order.items?.map((item: any, idx: number) => {
                        const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                        const isLast = idx === order.items.length - 1;
                        return (
                            <View key={idx} style={isLast ? styles.tableRowLast : styles.tableRow}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemQty}>×{item.quantity}</Text>
                                <Text style={styles.itemPrice}>Rs. {(price * item.quantity).toLocaleString()}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>Subtotal</Text>
                        <Text style={styles.subtotalValue}>Rs. {order.subtotal?.toLocaleString()}</Text>
                    </View>
                    <View style={styles.deliveryRow}>
                        <Text style={styles.deliveryLabel}>Delivery Charge</Text>
                        <Text style={styles.deliveryValue}>Rs. {order.deliveryCharge?.toLocaleString()}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>Rs. {order.total?.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Shipping & Payment */}
                <View style={[styles.section, { marginTop: 15 }]}>
                    <View style={styles.gridTwo}>
                        <View style={styles.gridItem}>
                            <Text style={styles.sectionTitle}>Shipping Address</Text>
                            <Text style={styles.addressText}>
                                {order.shippingAddress?.fullName || order.shippingAddress?.firstName}
                            </Text>
                            <Text style={styles.addressText}>{order.shippingAddress?.address}</Text>
                            <Text style={styles.addressText}>
                                {order.shippingAddress?.city}, {order.shippingAddress?.district}
                            </Text>
                            <Text style={styles.addressText}>Phone: {order.shippingAddress?.phone}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.sectionTitle}>Payment Method</Text>
                            <Text style={styles.paymentMethod}>{getPaymentText(order.paymentMethod)}</Text>
                            {order.paymentMethod === "bank" && (
                                <Text style={styles.paymentStatus}>
                                    Payment Proof: {order.paymentProof ? "✓ Uploaded" : "Pending"}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>ENDER EXCLUSIVE</Text>
                    <Text style={styles.footerText}>Thank you for your order!</Text>
                    <Text style={styles.footerText}>www.enderexclusive.com</Text>
                </View>
            </Page>
        </Document>
    );
};