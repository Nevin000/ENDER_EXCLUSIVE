"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

import {
    HiOutlineUser,
    HiOutlinePhone,
    HiOutlineMail,
    HiOutlineLocationMarker,
    HiOutlineCreditCard,
    HiOutlineCash,
    HiOutlineCheckCircle,
    HiArrowLeft,
    HiOutlineUpload,
    HiOutlineDocumentText,
    HiOutlineTrash,
    HiOutlineOfficeBuilding,
} from "react-icons/hi";
import {
    FaTruck,
    FaShieldAlt,
    FaClock,
    FaBuilding,
    FaCheck,
    FaChevronRight,
    FaMoneyBillWave,
} from "react-icons/fa";

import { createOrder } from "@/services/orderService";
import { CartItem } from "@/types/cart";
import { uploadImageToCloudinary } from "@/services/cloudinaryService";

// 🔥 Bank Details
const BANK_DETAILS = {
    bankName: "Commercial Bank of Ceylon",
    accountName: "ENDER EXCLUSIVE (PVT) LTD",
    accountNumber: "1234567890",
    branch: "Colombo Main Branch",
};

// 🔥 Sri Lanka Districts (25)
const SRI_LANKA_DISTRICTS = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
    "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
    "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
    "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

// 🔥 Generate Order Number
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
    const { user } = useAuth();
    const { cart, clearCart } = useCart();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank" | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [agreeTerms, setAgreeTerms] = useState(false);

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

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🔥 Calculate totals
    const subtotal = cart.reduce((total, item) => {
        const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
        return total + price * item.quantity;
    }, 0);

    const deliveryCharge = (() => {
        const uniqueProducts = new Map<string, number>();
        cart.forEach((item) => {
            const charge = item.deliveryCharge ?? 0;
            if (!uniqueProducts.has(item.productId)) {
                uniqueProducts.set(item.productId, charge);
            }
        });
        return [...uniqueProducts.values()].reduce((sum, charge) => sum + charge, 0);
    })();

    const total = subtotal + deliveryCharge;

    // 🔥 Auto fill user data
    useEffect(() => {
        if (user) {
            const nameParts = user.displayName?.split(" ") || [];
            setFormData((prev) => ({
                ...prev,
                firstName: nameParts[0] || "",
                lastName: nameParts.slice(1).join(" ") || "",
                email: user.email || "",
            }));
        }
    }, [user]);

    // 🔥 Redirect if cart is empty
    useEffect(() => {
        if (cart.length === 0 && !loading) {
            router.push("/cart");
        }
    }, [cart, loading, router]);

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
            alert("Please upload payment receipt");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        else if (!/^[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, "")))
            newErrors.phone = "Invalid phone number";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.district) newErrors.district = "District is required";
        if (!agreeTerms) newErrors.terms = "Please agree to terms";

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

    // 🔥 Upload receipt slip to Cloudinary
    const uploadReceiptToStorage = async (file: File): Promise<string> => {
        return await uploadImageToCloudinary(file);
    };

    // 🔥 Submit Order - with payment proof upload
    const handleSubmit = async () => {
        if (!validateStep2()) return;

        if (!user) {
            alert("Please login first");
            router.push("/login");
            return;
        }

        setLoading(true);

        try {
            const orderNumber = generateOrderNumber();
            const fullName = `${formData.firstName} ${formData.lastName}`;

            // 🔥 Upload payment slip if bank transfer was selected
            let paymentProofUrl: string | null = null;
            if (paymentMethod === "bank" && receiptFile) {
                console.log("📤 Uploading payment receipt...");
                try {
                    paymentProofUrl = await uploadReceiptToStorage(receiptFile);
                    console.log("✅ Receipt uploaded:", paymentProofUrl);
                } catch (uploadError: any) {
                    console.error("❌ Receipt upload failed:", uploadError);
                    alert(`Failed to upload payment receipt: ${uploadError.message || "Please try again."}`);
                    setLoading(false);
                    return;
                }
            }

            const orderData = {
                orderNo: orderNumber,
                userId: user.uid,
                userEmail: user.email || "",
                customerName: fullName,
                items: cart,
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

            console.log("📦 Creating order...", orderData);

            const orderId = await createOrder(orderData);

            console.log("✅ Order created with ID:", orderId);

            // 🔥 Clear cart
            clearCart();

            // 🔥 Redirect to success page
            console.log("🔀 Redirecting to:", `/checkout-success/${orderId}`);

            // 🔥 Use window.location for more reliable navigation
            window.location.href = `/checkout-success/${orderId}`;

        } catch (error: any) {
            console.error("❌ Error placing order:", error);
            alert(`Failed to place order: ${error.message || "Please try again."}`);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, label: "Payment" },
        { number: 2, label: "Shipping" },
        { number: 3, label: "Review" },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        {paymentMethod === "bank" && receiptFile
                            ? "Uploading receipt & placing your order..."
                            : "Processing your order..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/cart" className="text-gray-400 hover:text-gray-600 transition">
                        <HiArrowLeft className="text-2xl" />
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
                </div>

                {/* Steps Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-2 sm:gap-4">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm transition-all ${currentStep >= step.number
                                            ? "border-red-500 bg-red-500 text-white"
                                            : "border-gray-300 text-gray-400"
                                        }`}
                                >
                                    {currentStep > step.number ? <FaCheck /> : step.number}
                                </div>
                                <span
                                    className={`hidden sm:block ml-2 text-sm font-medium ${currentStep >= step.number ? "text-gray-900" : "text-gray-400"
                                        }`}
                                >
                                    {step.label}
                                </span>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-8 sm:w-12 h-0.5 mx-2 transition-all ${currentStep > step.number ? "bg-red-500" : "bg-gray-300"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* LEFT: Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <AnimatePresence mode="wait">
                                {/* STEP 1: Payment Method */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <HiOutlineCreditCard className="text-red-500 text-2xl" />
                                            Select Payment Method
                                        </h2>

                                        <p className="text-gray-500 text-sm mb-6">
                                            Choose your preferred payment method to continue
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* COD Option */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPaymentMethod("cod");
                                                    setBankConfirmChecked(false);
                                                }}
                                                className={`p-6 rounded-xl border-2 text-left transition-all ${paymentMethod === "cod"
                                                        ? "border-red-500 bg-red-50 shadow-md ring-2 ring-red-500/20"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${paymentMethod === "cod"
                                                                ? "border-red-500 bg-red-500"
                                                                : "border-gray-300"
                                                            }`}
                                                    >
                                                        {paymentMethod === "cod" && (
                                                            <HiOutlineCheckCircle className="text-white text-base" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FaMoneyBillWave className="text-2xl text-green-600" />
                                                            <span className="font-semibold text-lg">Cash on Delivery</span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 leading-relaxed">
                                                            Pay when your parcel arrives at your doorstep
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="inline-block text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                                                                ✅ No extra charges
                                                            </span>
                                                            <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                                                🔒 Secure
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
                                                className={`p-6 rounded-xl border-2 text-left transition-all ${paymentMethod === "bank"
                                                        ? "border-red-500 bg-red-50 shadow-md ring-2 ring-red-500/20"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${paymentMethod === "bank"
                                                                ? "border-red-500 bg-red-500"
                                                                : "border-gray-300"
                                                            }`}
                                                    >
                                                        {paymentMethod === "bank" && (
                                                            <HiOutlineCheckCircle className="text-white text-base" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FaBuilding className="text-2xl text-blue-600" />
                                                            <span className="font-semibold text-lg">Bank Transfer</span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 leading-relaxed">
                                                            Pay via bank transfer and upload your payment receipt
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                                                🏦 All banks
                                                            </span>
                                                            <span className="inline-block text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                                                                📱 Online banking
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>

                                        {/* Bank Details */}
                                        <AnimatePresence>
                                            {paymentMethod === "bank" && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-4 overflow-hidden"
                                                >
                                                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <HiOutlineOfficeBuilding className="text-blue-600 text-xl" />
                                                            <h4 className="font-semibold text-blue-800">Bank Details</h4>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                            <div className="bg-white/70 rounded-lg p-3">
                                                                <p className="text-gray-500 text-xs">Bank</p>
                                                                <p className="font-medium">{BANK_DETAILS.bankName}</p>
                                                            </div>
                                                            <div className="bg-white/70 rounded-lg p-3">
                                                                <p className="text-gray-500 text-xs">Account Name</p>
                                                                <p className="font-medium">{BANK_DETAILS.accountName}</p>
                                                            </div>
                                                            <div className="bg-white/70 rounded-lg p-3">
                                                                <p className="text-gray-500 text-xs">Account Number</p>
                                                                <p className="font-bold text-blue-800 text-lg">
                                                                    {BANK_DETAILS.accountNumber}
                                                                </p>
                                                            </div>
                                                            <div className="bg-white/70 rounded-lg p-3">
                                                                <p className="text-gray-500 text-xs">Branch</p>
                                                                <p className="font-medium">{BANK_DETAILS.branch}</p>
                                                            </div>
                                                        </div>

                                                        {/* Upload Receipt */}
                                                        <div className="mt-4 border-t border-blue-200 pt-4">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Upload Payment Receipt <span className="text-red-500">*</span>
                                                            </label>

                                                            {!receiptUploaded ? (
                                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                                    <label className="flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 transition bg-white">
                                                                        <HiOutlineUpload className="text-xl text-gray-400" />
                                                                        <span className="text-sm text-gray-600 font-medium">
                                                                            Choose File
                                                                        </span>
                                                                        <input
                                                                            ref={fileInputRef}
                                                                            type="file"
                                                                            accept="image/*,.pdf"
                                                                            onChange={handleFileUpload}
                                                                            className="hidden"
                                                                        />
                                                                    </label>
                                                                    <span className="text-xs text-gray-400">
                                                                        JPG, PNG, PDF (Max 5MB)
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-sm">
                                                                    <div className="flex items-center gap-4">
                                                                        {receiptPreview && (
                                                                            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm shrink-0">
                                                                                <img
                                                                                    src={receiptPreview}
                                                                                    alt="Receipt"
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
                                                                                <HiOutlineCheckCircle className="text-green-500" />
                                                                                Receipt Uploaded
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                                {receiptFile?.name}
                                                                            </p>
                                                                            <p className="text-xs text-gray-400">
                                                                                {(receiptFile?.size ? (receiptFile.size / 1024).toFixed(1) : 0)} KB
                                                                            </p>
                                                                        </div>
                                                                        <button
                                                                            onClick={handleRemoveFile}
                                                                            className="text-red-500 hover:text-red-700 transition p-2 hover:bg-red-50 rounded-lg"
                                                                        >
                                                                            <HiOutlineTrash className="text-lg" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Confirm Checkbox */}
                                                        <div className="mt-4">
                                                            <label className="flex items-start gap-3 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={bankConfirmChecked}
                                                                    onChange={(e) => setBankConfirmChecked(e.target.checked)}
                                                                    className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500 mt-0.5"
                                                                />
                                                                <span className="text-sm text-gray-700 leading-relaxed">
                                                                    I confirm that I have made the bank transfer to the above account
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {paymentMethod === "cod" && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="mt-4 bg-green-50 rounded-xl p-4 border border-green-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <HiOutlineCheckCircle className="text-xl text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-green-800">Cash on Delivery</p>
                                                        <p className="text-sm text-green-600">
                                                            Pay when your parcel arrives. No additional charges.
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {/* STEP 2: Shipping Details */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <HiOutlineLocationMarker className="text-red-500 text-2xl" />
                                            Shipping Details
                                        </h2>

                                        <p className="text-gray-500 text-sm mb-6">
                                            Enter your shipping information
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    First Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.firstName ? "border-red-500" : "border-gray-300"
                                                        } focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition`}
                                                    placeholder="John"
                                                />
                                                {errors.firstName && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Last Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.lastName ? "border-red-500" : "border-gray-300"
                                                        } focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition`}
                                                    placeholder="Doe"
                                                />
                                                {errors.lastName && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"
                                                        } focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition`}
                                                    placeholder="john@example.com"
                                                />
                                                {errors.email && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? "border-red-500" : "border-gray-300"
                                                        } focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition`}
                                                    placeholder="071 234 5678"
                                                />
                                                {errors.phone && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                                )}
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.address ? "border-red-500" : "border-gray-300"
                                                        } focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition`}
                                                    placeholder="123 Main St, Colombo"
                                                />
                                                {errors.address && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    City <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.city ? "border-red-500" : "border-gray-300"
                                                        } focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition`}
                                                    placeholder="Colombo"
                                                />
                                                {errors.city && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    District <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="district"
                                                    value={formData.district}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.district ? "border-red-500" : "border-gray-300"
                                                        } focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-white`}
                                                >
                                                    <option value="">Select District</option>
                                                    {SRI_LANKA_DISTRICTS.map((district) => (
                                                        <option key={district} value={district}>
                                                            {district}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.district && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.district}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Postal Code
                                                </label>
                                                <input
                                                    type="text"
                                                    name="postalCode"
                                                    value={formData.postalCode}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                                                    placeholder="81000"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Order Notes
                                                </label>
                                                <textarea
                                                    name="notes"
                                                    value={formData.notes}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition resize-none"
                                                    placeholder="Any special instructions..."
                                                />
                                            </div>
                                        </div>

                                        {/* Terms & Conditions */}
                                        <div className="mt-6">
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
                                                    className={`w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500 mt-0.5 ${errors.terms ? "border-red-500" : ""
                                                        }`}
                                                />
                                                <span className="text-sm text-gray-700 leading-relaxed">
                                                    I agree to the{" "}
                                                    <Link href="/terms" className="text-red-500 hover:underline">
                                                        Terms & Conditions
                                                    </Link>{" "}
                                                    and{" "}
                                                    <Link href="/privacy" className="text-red-500 hover:underline">
                                                        Privacy Policy
                                                    </Link>
                                                </span>
                                            </label>
                                            {errors.terms && (
                                                <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP 3: Review */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <HiOutlineDocumentText className="text-red-500 text-2xl" />
                                            Review Order
                                        </h2>

                                        {/* Payment Method Summary */}
                                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                            <h3 className="font-semibold text-gray-800 mb-2">Payment Method</h3>
                                            <div className="flex items-center gap-2">
                                                {paymentMethod === "cod" ? (
                                                    <>
                                                        <FaMoneyBillWave className="text-green-600 text-xl" />
                                                        <span className="font-medium">Cash on Delivery</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaBuilding className="text-blue-600 text-xl" />
                                                        <span className="font-medium">Bank Transfer</span>
                                                        {receiptUploaded && (
                                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                                Receipt Uploaded ✓
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Customer Details */}
                                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                            <h3 className="font-semibold text-gray-800 mb-2">Shipping Details</h3>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="col-span-2">
                                                    <span className="text-gray-500">Name:</span>
                                                    <span className="ml-2 font-medium">
                                                        {formData.firstName} {formData.lastName}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Phone:</span>
                                                    <span className="ml-2 font-medium">{formData.phone}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Email:</span>
                                                    <span className="ml-2 font-medium">{formData.email}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-gray-500">Address:</span>
                                                    <span className="ml-2 font-medium">
                                                        {formData.address}, {formData.city}, {formData.district}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <h3 className="font-semibold text-gray-800 mb-2">Order Items</h3>
                                            <div className="space-y-1.5">
                                                {cart.map((item) => {
                                                    const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                                                    return (
                                                        <div key={item.id} className="flex justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {item.name} <span className="text-gray-400">×{item.quantity}</span>
                                                            </span>
                                                            <span className="font-medium">
                                                                Rs. {(price * item.quantity).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Subtotal</span>
                                                        <span>Rs. {subtotal.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Delivery</span>
                                                        <span>Rs. {deliveryCharge.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                                        <span>Total</span>
                                                        <span className="text-red-600">Rs. {total.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={prevStep}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition ${currentStep > 1
                                            ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                            : "text-gray-300 cursor-not-allowed"
                                        }`}
                                    disabled={currentStep === 1}
                                >
                                    ← Back
                                </button>

                                {currentStep < 3 ? (
                                    <button
                                        onClick={nextStep}
                                        className="px-8 py-2.5 rounded-lg font-medium bg-black text-white hover:bg-gray-800 transition flex items-center gap-2"
                                    >
                                        Continue
                                        <FaChevronRight className="text-sm" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className={`px-8 py-2.5 rounded-lg font-bold text-white transition flex items-center gap-2 ${loading
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/30"
                                            }`}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <span>📦</span>
                                                Place Order
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                            {/* Items */}
                            <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                                {cart.map((item) => {
                                    const price = item.isOnSale ? item.salePrice ?? item.price : item.price;
                                    return (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600 truncate">
                                                {item.name} <span className="text-gray-400">×{item.quantity}</span>
                                            </span>
                                            <span className="font-medium">Rs. {(price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <hr className="border-gray-200 mb-4" />

                            {/* Totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Delivery</span>
                                    <span className="font-medium text-orange-600">Rs. {deliveryCharge.toLocaleString()}</span>
                                </div>
                            </div>

                            <hr className="border-gray-200 my-4" />

                            <div className="flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span className="text-red-600">Rs. {total.toLocaleString()}</span>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-400">
                                <div className="flex items-center gap-2">
                                    <FaShieldAlt className="text-green-500 text-sm" />
                                    <span>Secure Checkout</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-blue-500 text-sm" />
                                    <span>Fast Delivery</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaTruck className="text-orange-500 text-sm" />
                                    <span>Free Returns</span>
                                </div>
                            </div>

                            {/* Payment Method Display */}
                            {paymentMethod && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">Selected Payment</p>
                                    <p className="text-sm font-medium flex items-center gap-2 mt-0.5">
                                        {paymentMethod === "cod" ? (
                                            <>
                                                <FaMoneyBillWave className="text-green-600" />
                                                Cash on Delivery
                                            </>
                                        ) : (
                                            <>
                                                <FaBuilding className="text-blue-600" />
                                                Bank Transfer
                                                {receiptUploaded && (
                                                    <span className="text-xs text-green-600">✓</span>
                                                )}
                                            </>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}