"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

import {
    HiOutlineCreditCard,
    HiOutlineCheckCircle,
    HiOutlineUpload,
    HiOutlineDocumentText,
    HiOutlineTrash,
    HiOutlineOfficeBuilding,
} from "react-icons/hi";
import {
    FaTruck,
    FaShieldAlt,
    FaClock,
    FaCheck,
    FaChevronRight,
    FaMoneyBillWave,
    FaBuilding,
} from "react-icons/fa";
import { Flame, ArrowRight, ShieldCheck, ShoppingBag, MapPin, User, Phone, Mail, FileText, CheckCircle2 } from "lucide-react";

import { createOrder } from "@/services/orderService";
import { CartItem } from "@/types/cart";
import { uploadImageToCloudinary } from "@/services/cloudinaryService";
import { sendOrderEmails } from "@/services/emailService";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

// Default Bank Details Fallback
const DEFAULT_BANK_DETAILS = {
    bankName: "Commercial Bank of Ceylon",
    accountName: "ENDER EXCLUSIVE (PVT) LTD",
    accountNumber: "1234567890",
    branch: "Colombo Main Branch",
};

// Sri Lanka Districts (25)
const SRI_LANKA_DISTRICTS = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
    "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
    "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
    "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

// Generate Order Number
const generateOrderNumber = () => {
    const prefix = "EX";
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    return `${prefix}${year}${month}${day}${random}`;
};

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { cart, clearCart, removeItem } = useCart();

    // Only checkout the items selected in cart page
    const checkoutItems = useMemo(() => {
        const selectedIds = searchParams.get("items");
        if (!selectedIds) return cart; // fallback: full cart
        const ids = new Set(selectedIds.split(","));
        return cart.filter((item) => ids.has(item.id));
    }, [cart, searchParams]);

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank" | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [outOfStockItems, setOutOfStockItems] = useState<Array<{ id: string; productId: string; name: string; availableStock: number; requestedQty: number }>>([]);
    const [orderSuccessModal, setOrderSuccessModal] = useState<{ orderId: string; orderNo: string } | null>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        district: "",
        postalCode: "",
        notes: "",
    });

    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [receiptUploaded, setReceiptUploaded] = useState(false);
    const [bankConfirmChecked, setBankConfirmChecked] = useState(false);
    const [bankDetails, setBankDetails] = useState(DEFAULT_BANK_DETAILS);

    // Live stock verification check for checkout items
    useEffect(() => {
        async function checkLiveStock() {
            if (!checkoutItems || checkoutItems.length === 0) return;
            const oosList: typeof outOfStockItems = [];

            for (const item of checkoutItems) {
                try {
                    const pRef = doc(db, "products", item.productId);
                    const pSnap = await getDoc(pRef);
                    if (pSnap.exists()) {
                        const liveStock = pSnap.data().stock ?? 0;
                        if (liveStock < item.quantity) {
                            oosList.push({
                                id: item.id,
                                productId: item.productId,
                                name: item.name,
                                availableStock: liveStock,
                                requestedQty: item.quantity,
                            });
                        }
                    }
                } catch (err) {
                    console.error("Error verifying stock for item:", item.name, err);
                }
            }
            setOutOfStockItems(oosList);
        }
        checkLiveStock();
    }, [checkoutItems]);

    // Fetch Store Settings
    useEffect(() => {
        async function fetchStoreSettings() {
            try {
                const docRef = doc(db, "settings", "store_config");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setBankDetails({
                        bankName: data.bankName || DEFAULT_BANK_DETAILS.bankName,
                        accountName: data.accountTitle || DEFAULT_BANK_DETAILS.accountName,
                        accountNumber: data.accountNumber || DEFAULT_BANK_DETAILS.accountNumber,
                        branch: data.branchName || DEFAULT_BANK_DETAILS.branch,
                    });
                }
            } catch (err) {
                console.error("Error loading bank details from Firestore:", err);
            }
        }
        fetchStoreSettings();
    }, []);

    // Auto-fill user profile data from Firestore & Auth
    useEffect(() => {
        async function loadUserProfile() {
            if (!user) return;

            const nameParts = user.displayName?.split(" ") || [];
            const initialFirst = nameParts[0] || "";
            const initialLast = nameParts.slice(1).join(" ") || "";

            setFormData((prev) => ({
                ...prev,
                firstName: prev.firstName || initialFirst,
                lastName: prev.lastName || initialLast,
                email: prev.email || user.email || "",
            }));

            try {
                const userRef = doc(db, "users", user.uid);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setFormData((prev) => ({
                        ...prev,
                        firstName: prev.firstName || data.firstName || initialFirst,
                        lastName: prev.lastName || data.lastName || initialLast,
                        email: prev.email || data.email || user.email || "",
                        phone: prev.phone || data.phone || data.mobilePhone || "",
                        address: prev.address || data.address || data.shippingAddress || "",
                        city: prev.city || data.city || "",
                        district: prev.district || data.district || "",
                        postalCode: prev.postalCode || data.postalCode || "",
                    }));
                }
            } catch (err) {
                console.error("Error loading user profile for checkout:", err);
            }
        }
        loadUserProfile();
    }, [user]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate totals — only from selected items
    const subtotal = checkoutItems.reduce((total, item) => {
        const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
        return total + price * item.quantity;
    }, 0);

    const deliveryCharge = (() => {
        const uniqueProducts = new Map<string, number>();
        checkoutItems.forEach((item) => {
            const charge = item.deliveryCharge ?? 0;
            if (!uniqueProducts.has(item.productId)) {
                uniqueProducts.set(item.productId, charge);
            }
        });
        return [...uniqueProducts.values()].reduce((sum, charge) => sum + charge, 0);
    })();

    const total = subtotal + deliveryCharge;

    // Redirect if cart is empty or checkout items is empty
    useEffect(() => {
        if ((cart.length === 0 || checkoutItems.length === 0) && !loading) {
            router.push("/cart");
        }
    }, [cart, checkoutItems, loading, router]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert("File size must be less than 5MB");
                return;
            }
            setReceiptFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setReceiptUploaded(true);
        }
    };

    const handleRemoveFile = () => {
        setReceiptFile(null);
        setReceiptPreview(null);
        setReceiptUploaded(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const validateStep1 = () => {
        if (!paymentMethod) {
            alert("Please select a payment method");
            return false;
        }
        if (paymentMethod === "bank" && !bankConfirmChecked) {
            alert("Please confirm you have made the bank transfer");
            return false;
        }
        if (paymentMethod === "bank" && !receiptUploaded) {
            alert("Please upload your payment receipt");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email address";
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!/^[0-9]{9,15}$/.test(formData.phone.replace(/\s/g, "").replace(/\+/g, "")))
            newErrors.phone = "Invalid phone number";
        if (!formData.address.trim()) newErrors.address = "Street address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.district) newErrors.district = "District is required";
        if (!agreeTerms) newErrors.terms = "You must agree to the terms to proceed";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        } else if (currentStep === 2 && validateStep2()) {
            setCurrentStep(3);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    // Upload receipt slip to Cloudinary
    const uploadReceiptToStorage = async (file: File): Promise<string> => {
        return await uploadImageToCloudinary(file);
    };

    // Submit Order
    const handleSubmit = async () => {
        if (!checkoutItems || checkoutItems.length === 0) {
            alert("Your checkout cart is empty. Please select items from your cart.");
            router.push("/cart");
            return;
        }

        if (!validateStep2()) return;

        if (!user) {
            alert("Please login to place an order");
            router.push("/login");
            return;
        }

        setLoading(true);

        try {
            const orderNumber = generateOrderNumber();
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            let paymentProofUrl: string | null = null;
            if (paymentMethod === "bank" && receiptFile) {
                try {
                    paymentProofUrl = await uploadReceiptToStorage(receiptFile);
                } catch (uploadError: any) {
                    console.error("Receipt upload failed:", uploadError);
                    alert(`Failed to upload payment receipt: ${uploadError.message || "Please try again."}`);
                    setLoading(false);
                    return;
                }
            }

            const orderData = {
                orderNo: orderNumber,
                userId: user.uid,
                userEmail: user.email || formData.email,
                customerName: fullName,
                items: checkoutItems,
                subtotal,
                deliveryCharge,
                total,
                paymentMethod: paymentMethod as "cod" | "bank",
                paymentStatus: (paymentMethod === "bank" && paymentProofUrl ? "paid" : "pending") as "pending" | "paid" | "failed",
                orderStatus: "pending" as const,
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    fullName: fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    district: formData.district,
                    postalCode: formData.postalCode || "",
                    notes: formData.notes || "",
                },
                delivery: {
                    method: "standard" as const,
                    charge: deliveryCharge,
                    estimatedDays: 3,
                },
                paymentProof: paymentProofUrl,
                trackingNumber: null,
                orderDate: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const orderId = await createOrder(orderData);

            // Send confirmation emails in background
            sendOrderEmails({ ...orderData, id: orderId });

            // Clear cart
            clearCart();

            // Display Order Placed Successfully message modal
            setOrderSuccessModal({
                orderId,
                orderNo: orderNumber,
            });

            // Redirect directly to order details section
            setTimeout(() => {
                router.push(`/checkout-success/${orderId}`);
            }, 1000);

        } catch (error: any) {
            console.error("Error placing order:", error);
            alert(`Failed to place order: ${error.message || "Please try again."}`);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, label: "Payment Method" },
        { number: 2, label: "Shipping Details" },
        { number: 3, label: "Review & Confirm" },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#070707] text-zinc-900 dark:text-white transition-colors duration-300">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-black uppercase tracking-widest text-red-500">
                        {paymentMethod === "bank" && receiptFile
                            ? "Uploading Payment Receipt & Processing Order..."
                            : "Securing & Placing Your Order..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#070707] text-zinc-900 dark:text-white transition-colors duration-300 py-8 sm:py-12 lg:py-16 pb-28">
            <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/cart" className="p-2.5 rounded-full bg-zinc-100 dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-red-500 transition">
                            <ArrowRight className="w-5 h-5 rotate-180" />
                        </Link>
                        <div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
                                FINAL STEP
                            </span>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
                                Secure <span className="text-red-600 dark:text-red-500">Checkout</span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Out of Stock Alert Banner */}
                {outOfStockItems.length > 0 && (
                    <div className="bg-red-500/10 border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-black text-sm uppercase tracking-wider">
                            <Flame className="w-5 h-5 fill-red-500 text-red-500" />
                            <span>Stock Availability Notice</span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed">
                            The following product(s) in your checkout are currently out of stock or have insufficient inventory. Please remove them to complete your purchase:
                        </p>
                        <div className="space-y-3">
                            {outOfStockItems.map((oos) => (
                                <div key={oos.id} className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#181818] p-4 rounded-2xl border border-red-500/30 text-xs shadow-sm">
                                    <div className="space-y-0.5">
                                        <p className="font-black text-zinc-900 dark:text-white text-sm">"{oos.name}"</p>
                                        <p className="text-red-600 dark:text-red-500 font-bold">
                                            {oos.availableStock === 0
                                                ? "Currently Out of Stock (0 available)"
                                                : `Only ${oos.availableStock} in stock (You requested ${oos.requestedQty})`}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await removeItem(oos.id);
                                            setOutOfStockItems((prev) => prev.filter((i) => i.id !== oos.id));
                                        }}
                                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                                    >
                                        Remove Out-of-Stock Item
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Steps Indicator */}
                <div className="bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-center gap-2 sm:gap-6">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 font-black text-sm transition-all shadow-md ${
                                        currentStep >= step.number
                                            ? "border-red-600 bg-red-600 text-white shadow-red-600/30"
                                            : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#181818] text-zinc-400"
                                    }`}
                                >
                                    {currentStep > step.number ? <FaCheck className="text-sm" /> : step.number}
                                </div>
                                <span
                                    className={`hidden md:block ml-3 text-xs sm:text-sm font-black uppercase tracking-wider ${
                                        currentStep >= step.number ? "text-zinc-900 dark:text-white" : "text-zinc-400"
                                    }`}
                                >
                                    {step.label}
                                </span>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-8 sm:w-16 h-1 mx-2 sm:mx-4 rounded-full transition-all ${
                                            currentStep > step.number ? "bg-red-600" : "bg-zinc-200 dark:bg-zinc-800"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
                    
                    {/* LEFT: Step Forms (2/3) */}
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
                            
                            <AnimatePresence mode="wait">
                                
                                {/* ===== STEP 1: PAYMENT METHOD ===== */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-wider text-red-500">Step 1 of 3</span>
                                            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                                                <HiOutlineCreditCard className="text-red-500 text-3xl" />
                                                <span>Select Payment Method</span>
                                            </h2>
                                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                                                Choose your preferred payment method to proceed with your order.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                            
                                            {/* COD Option */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPaymentMethod("cod");
                                                    setBankConfirmChecked(false);
                                                }}
                                                className={`p-6 rounded-3xl border-2 text-left transition-all cursor-pointer ${
                                                    paymentMethod === "cod"
                                                        ? "border-red-600 bg-red-500/10 dark:bg-red-950/30 shadow-xl shadow-red-500/10"
                                                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141414] hover:border-zinc-300 dark:hover:border-zinc-700"
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                                                            paymentMethod === "cod"
                                                                ? "border-red-600 bg-red-600 text-white"
                                                                : "border-zinc-300 dark:border-zinc-700"
                                                        }`}
                                                    >
                                                        {paymentMethod === "cod" && (
                                                            <HiOutlineCheckCircle className="text-white text-base" />
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <FaMoneyBillWave className="text-xl text-emerald-500" />
                                                            <span className="font-black uppercase tracking-tight text-base sm:text-lg">
                                                                Cash on Delivery
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                                            Pay cash directly when your parcel is delivered to your doorstep.
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 pt-1">
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                                                ✅ No Hidden Charges
                                                            </span>
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                                                🔒 100% Safe
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Bank Transfer Option */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPaymentMethod("bank");
                                                    setBankConfirmChecked(false);
                                                }}
                                                className={`p-6 rounded-3xl border-2 text-left transition-all cursor-pointer ${
                                                    paymentMethod === "bank"
                                                        ? "border-red-600 bg-red-500/10 dark:bg-red-950/30 shadow-xl shadow-red-500/10"
                                                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141414] hover:border-zinc-300 dark:hover:border-zinc-700"
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                                                            paymentMethod === "bank"
                                                                ? "border-red-600 bg-red-600 text-white"
                                                                : "border-zinc-300 dark:border-zinc-700"
                                                        }`}
                                                    >
                                                        {paymentMethod === "bank" && (
                                                            <HiOutlineCheckCircle className="text-white text-base" />
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <FaBuilding className="text-xl text-amber-500" />
                                                            <span className="font-black uppercase tracking-tight text-base sm:text-lg">
                                                                Direct Bank Deposit
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                                            Transfer via Online Banking / ATM and upload your payment slip.
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 pt-1">
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                                                🏦 Direct Transfer
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>

                                        </div>

                                        {/* Bank Details & Receipt Upload Container */}
                                        <AnimatePresence>
                                            {paymentMethod === "bank" && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="bg-amber-500/10 rounded-3xl p-6 sm:p-8 border border-amber-500/30 space-y-6">
                                                        
                                                        <div className="flex items-center gap-2.5 text-amber-500">
                                                            <HiOutlineOfficeBuilding className="text-2xl" />
                                                            <h4 className="font-black uppercase tracking-wider text-sm">
                                                                Official Bank Account Details
                                                            </h4>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                                            <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                                                <p className="text-[10px] font-black uppercase text-zinc-400">Bank Name</p>
                                                                <p className="font-black text-sm text-zinc-900 dark:text-white">{bankDetails.bankName}</p>
                                                            </div>
                                                            <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                                                <p className="text-[10px] font-black uppercase text-zinc-400">Account Title</p>
                                                                <p className="font-black text-sm text-zinc-900 dark:text-white">{bankDetails.accountName}</p>
                                                            </div>
                                                            <div className="bg-white dark:bg-[#181818] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 sm:col-span-2">
                                                                <p className="text-[10px] font-black uppercase text-zinc-400">Account Number</p>
                                                                <p className="font-black text-lg text-amber-500 tracking-wider">
                                                                    {bankDetails.accountNumber}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Upload Payment Slip */}
                                                        <div className="space-y-3 pt-2">
                                                            <label className="block text-xs font-black uppercase tracking-wider">
                                                                Upload Payment Receipt Slip <span className="text-red-500">*</span>
                                                            </label>

                                                            {!receiptUploaded ? (
                                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                                    <label className="flex items-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500 transition cursor-pointer bg-white dark:bg-[#181818] shadow-sm">
                                                                        <HiOutlineUpload className="text-xl text-amber-500" />
                                                                        <span className="text-xs font-black uppercase tracking-wider">
                                                                            Choose Slip File
                                                                        </span>
                                                                        <input
                                                                            ref={fileInputRef}
                                                                            type="file"
                                                                            accept="image/*,.pdf"
                                                                            onChange={handleFileUpload}
                                                                            className="hidden"
                                                                        />
                                                                    </label>
                                                                    <span className="text-[11px] text-zinc-400 font-medium">
                                                                        Supports JPG, PNG, PDF (Max 5MB)
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-white dark:bg-[#181818] rounded-2xl p-4 border-2 border-emerald-500/50 shadow-sm flex items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-4">
                                                                        {receiptPreview && (
                                                                            <img
                                                                                src={receiptPreview}
                                                                                alt="Slip Receipt"
                                                                                className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                                                                            />
                                                                        )}
                                                                        <div>
                                                                            <p className="text-xs font-black text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                                                                                <HiOutlineCheckCircle />
                                                                                Receipt Uploaded
                                                                            </p>
                                                                            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                                                                                {receiptFile?.name}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={handleRemoveFile}
                                                                        className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition cursor-pointer"
                                                                        title="Remove File"
                                                                    >
                                                                        <HiOutlineTrash className="text-lg" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Confirm Transfer Checkbox */}
                                                        <div className="pt-2">
                                                            <label className="flex items-start gap-3 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={bankConfirmChecked}
                                                                    onChange={(e) => setBankConfirmChecked(e.target.checked)}
                                                                    className="w-5 h-5 text-red-600 border-zinc-300 rounded focus:ring-red-600 mt-0.5 cursor-pointer"
                                                                />
                                                                <span className="text-xs text-zinc-700 dark:text-zinc-300 font-bold leading-relaxed">
                                                                    I confirm that I have completed the bank deposit to the above Ender Exclusive account number.
                                                                </span>
                                                            </label>
                                                        </div>

                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                    </motion.div>
                                )}

                                {/* ===== STEP 2: SHIPPING DETAILS ===== */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-wider text-red-500">Step 2 of 3</span>
                                            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                                                <MapPin className="text-red-500 w-7 h-7" />
                                                <span>Shipping & Delivery Details</span>
                                            </h2>
                                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                                                Enter your full delivery address across Sri Lanka.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            
                                            {/* First Name */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                                                    First Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-[#181818] border ${
                                                        errors.firstName ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                                    } focus:ring-2 focus:ring-red-500 outline-none text-sm font-semibold transition`}
                                                    placeholder="First Name"
                                                />
                                                {errors.firstName && (
                                                    <p className="text-red-500 text-xs font-bold mt-1">{errors.firstName}</p>
                                                )}
                                            </div>

                                            {/* Last Name */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                                                    Last Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-[#181818] border ${
                                                        errors.lastName ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                                    } focus:ring-2 focus:ring-red-500 outline-none text-sm font-semibold transition`}
                                                    placeholder="Last Name"
                                                />
                                                {errors.lastName && (
                                                    <p className="text-red-500 text-xs font-bold mt-1">{errors.lastName}</p>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-[#181818] border ${
                                                        errors.email ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                                    } focus:ring-2 focus:ring-red-500 outline-none text-sm font-semibold transition`}
                                                    placeholder="your.email@example.com"
                                                />
                                                {errors.email && (
                                                    <p className="text-red-500 text-xs font-bold mt-1">{errors.email}</p>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                                                    Mobile Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-[#181818] border ${
                                                        errors.phone ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                                    } focus:ring-2 focus:ring-red-500 outline-none text-sm font-semibold transition`}
                                                    placeholder="07X XXX XXXX"
                                                />
                                                {errors.phone && (
                                                    <p className="text-red-500 text-xs font-bold mt-1">{errors.phone}</p>
                                                )}
                                            </div>

                                            {/* Street Address */}
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                                                    Street Delivery Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-[#181818] border ${
                                                        errors.address ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                                    } focus:ring-2 focus:ring-red-500 outline-none text-sm font-semibold transition`}
                                                    placeholder="House / Street / Lane details"
                                                />
                                                {errors.address && (
                                                    <p className="text-red-500 text-xs font-bold mt-1">{errors.address}</p>
                                                )}
                                            </div>

                                            {/* City */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                                                    City <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-[#181818] border ${
                                                        errors.city ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                                    } focus:ring-2 focus:ring-red-500 outline-none text-sm font-semibold transition`}
                                                    placeholder="City"
                                                />
                                                {errors.city && (
                                                    <p className="text-red-500 text-xs font-bold mt-1">{errors.city}</p>
                                                )}
                                            </div>

                                            {/* District Dropdown */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                                                    District <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="district"
                                                    value={formData.district}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-[#181818] border ${
                                                        errors.district ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
                                                    } focus:ring-2 focus:ring-red-500 outline-none text-sm font-semibold transition`}
                                                >
                                                    <option value="">Select District</option>
                                                    {SRI_LANKA_DISTRICTS.map((district) => (
                                                        <option key={district} value={district}>
                                                            {district}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.district && (
                                                    <p className="text-red-500 text-xs font-bold mt-1">{errors.district}</p>
                                                )}
                                            </div>

                                            {/* Postal Code */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                                                    Postal Code (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="postalCode"
                                                    value={formData.postalCode}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-[#181818] border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-red-500 outline-none text-sm font-semibold transition"
                                                    placeholder="Postal Code"
                                                />
                                            </div>

                                            {/* Order Notes */}
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                                                    Special Delivery Instructions (Optional)
                                                </label>
                                                <textarea
                                                    name="notes"
                                                    value={formData.notes}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-[#181818] border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-red-500 outline-none text-sm font-semibold transition resize-none"
                                                    placeholder="Delivery note, landmark, preferred time..."
                                                />
                                            </div>

                                        </div>

                                        {/* Terms Agreement Checkbox */}
                                        <div className="pt-2">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={agreeTerms}
                                                    onChange={(e) => {
                                                        setAgreeTerms(e.target.checked);
                                                        if (errors.terms) {
                                                            setErrors({ ...errors, terms: "" });
                                                        }
                                                    }}
                                                    className="w-5 h-5 text-red-600 border-zinc-300 rounded focus:ring-red-600 mt-0.5 cursor-pointer"
                                                />
                                                <span className="text-xs text-zinc-700 dark:text-zinc-300 font-bold leading-relaxed">
                                                    I agree to the Ender Exclusive order policies and confirm my delivery details are correct.
                                                </span>
                                            </label>
                                            {errors.terms && (
                                                <p className="text-red-500 text-xs font-bold mt-1">{errors.terms}</p>
                                            )}
                                        </div>

                                    </motion.div>
                                )}

                                {/* ===== STEP 3: REVIEW ORDER ===== */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-wider text-red-500">Step 3 of 3</span>
                                            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                                                <HiOutlineDocumentText className="text-red-500 text-3xl" />
                                                <span>Review & Place Order</span>
                                            </h2>
                                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                                                Review your payment and shipping details before completing your order.
                                            </p>
                                        </div>

                                        {/* Payment Summary Box */}
                                        <div className="bg-white dark:bg-[#181818] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Selected Payment Method</span>
                                            <div className="flex items-center gap-3">
                                                {paymentMethod === "cod" ? (
                                                    <>
                                                        <FaMoneyBillWave className="text-emerald-500 text-xl" />
                                                        <span className="font-black text-sm uppercase">Cash on Delivery (COD)</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaBuilding className="text-amber-500 text-xl" />
                                                        <span className="font-black text-sm uppercase">Direct Bank Deposit</span>
                                                        {receiptUploaded && (
                                                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                                                Slip Uploaded ✓
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Customer Details Box */}
                                        <div className="bg-white dark:bg-[#181818] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Shipping Address</span>
                                            <div className="text-xs font-bold space-y-1">
                                                <p className="text-sm font-black text-zinc-900 dark:text-white">{formData.firstName} {formData.lastName}</p>
                                                <p className="text-zinc-600 dark:text-zinc-400">{formData.address}, {formData.city}, {formData.district} {formData.postalCode}</p>
                                                <p className="text-zinc-600 dark:text-zinc-400">Phone: {formData.phone} • Email: {formData.email}</p>
                                            </div>
                                        </div>

                                        {/* Items Summary Table */}
                                        <div className="bg-white dark:bg-[#181818] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Order Items ({checkoutItems.length})</span>
                                            <div className="space-y-2 divide-y divide-zinc-100 dark:divide-zinc-800">
                                                {checkoutItems.map((item) => {
                                                    const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                                                    return (
                                                        <div key={item.id} className="pt-2 flex items-center justify-between text-xs font-bold">
                                                            <span className="truncate max-w-[250px]">
                                                                {item.name} <span className="text-zinc-400">(×{item.quantity})</span>
                                                            </span>
                                                            <span className="text-red-600 dark:text-red-500 font-black">
                                                                Rs. {(price * item.quantity).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                    </motion.div>
                                )}

                            </AnimatePresence>

                            {/* Step Navigation Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
                                <button
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition ${
                                        currentStep > 1
                                            ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                                            : "opacity-40 cursor-not-allowed text-zinc-400"
                                    }`}
                                >
                                    ← Back
                                </button>

                                {currentStep < 3 ? (
                                    <button
                                        onClick={nextStep}
                                        className="px-8 py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer"
                                    >
                                        <span>Continue to {steps[currentStep].label}</span>
                                        <FaChevronRight className="text-xs" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className={`px-10 py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center gap-2 cursor-pointer ${
                                            loading
                                                ? "bg-zinc-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-600/30 hover:scale-105"
                                        }`}
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>Place Order Now</span>
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* RIGHT: Order Summary Sticky Panel (1/3) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-7 sm:p-8 space-y-6 shadow-xl">
                            
                            <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-black uppercase tracking-tight">Order Summary</h2>
                                <span className="text-xs font-black text-red-500 uppercase tracking-wider">
                                    {checkoutItems.length} {checkoutItems.length === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>

                            {/* Items Scroll List */}
                            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                {checkoutItems.map((item) => {
                                    const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                                    return (
                                        <div key={item.id} className="flex justify-between items-center text-xs font-bold">
                                            <span className="truncate max-w-[180px]">
                                                {item.name} <span className="text-zinc-400">×{item.quantity}</span>
                                            </span>
                                            <span className="font-black text-zinc-900 dark:text-white">
                                                Rs. {(price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <hr className="border-zinc-200 dark:border-zinc-800" />

                            {/* Calculation Totals */}
                            <div className="space-y-3 text-xs font-bold">
                                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                    <span>Items Subtotal</span>
                                    <span className="font-black text-zinc-900 dark:text-white">
                                        Rs. {subtotal.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                    <span>Delivery Charge</span>
                                    <span className="font-black text-amber-500">
                                        {deliveryCharge === 0 ? "FREE" : `Rs. ${deliveryCharge.toLocaleString()}`}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-zinc-200 dark:border-zinc-800" />

                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-black uppercase tracking-wider">Grand Total</span>
                                <span className="text-3xl font-black text-red-600 dark:text-red-500">
                                    Rs. {total.toLocaleString()}
                                </span>
                            </div>

                            {/* Security Badges */}
                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2 text-[11px] font-black uppercase tracking-wider text-zinc-400">
                                <div className="flex items-center gap-2">
                                    <FaShieldAlt className="text-emerald-500 text-sm" />
                                    <span>100% Encrypted & Safe Order</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-amber-500 text-sm" />
                                    <span>Islandwide 3-Day Dispatch</span>
                                </div>
                            </div>

                            {/* Selected Payment Method Preview */}
                            {paymentMethod && (
                                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                                        Selected Payment
                                    </span>
                                    <div className="text-xs font-black uppercase text-amber-500 flex items-center gap-2">
                                        {paymentMethod === "cod" ? (
                                            <>
                                                <FaMoneyBillWave className="text-emerald-500" />
                                                <span>Cash on Delivery</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaBuilding className="text-amber-500" />
                                                <span>Direct Bank Deposit</span>
                                                {receiptUploaded && <span className="text-emerald-500">✓</span>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>

            </div>

            {/* ===== ORDER PLACED SUCCESSFULLY OVERLAY MODAL ===== */}
            {orderSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
                        {/* Ambient Background Glow */}
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                        {/* Success Icon */}
                        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30 animate-bounce">
                            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                        </div>

                        <div className="space-y-2">
                            <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest rounded-full">
                                Order Received 🎉
                            </span>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white pt-2">
                                Order Placed Successfully!
                            </h2>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                                Order <span className="font-bold text-amber-500 font-mono">#{orderSuccessModal.orderNo}</span> has been confirmed. Navigating directly to your receipt and details...
                            </p>
                        </div>

                        {/* Progress Indicator */}
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full animate-pulse w-full" />
                        </div>

                        <button
                            onClick={() => router.push(`/checkout-success/${orderSuccessModal.orderId}`)}
                            className="w-full py-4 bg-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-300 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span>View Order Details Now</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}