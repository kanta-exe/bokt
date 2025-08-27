import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { CheckCircle, Clock, Phone, Mail, MessageCircle } from "lucide-react";

interface BookingSuccessProps {
  bookingId: string;
  modelName: string;
  requesterName: string;
  startDate: string;
  duration: string;
  selectedDays?: string;
  shootSetting?: string;
  shootLocation?: string;
  budget: number;
}

export default function BookingSuccess({ 
  bookingId, 
  modelName, 
  requesterName, 
  startDate, 
  duration, 
  selectedDays,
  shootSetting,
  shootLocation,
  budget 
}: BookingSuccessProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-300">Your booking request has been successfully submitted</p>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-700 rounded-xl p-6 mb-8 border border-gray-600">
          <h2 className="text-xl font-semibold text-white mb-4">Booking Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Booking ID:</span>
              <span className="font-mono text-sm bg-gray-600 px-2 py-1 rounded text-gray-200">{bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Model:</span>
              <span className="font-medium text-white">{modelName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Date & Time:</span>
              <span className="font-medium text-white">{formatDate(startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Duration:</span>
              <span className="font-medium text-white">
                {duration === "MULTIPLE_DAYS" && selectedDays ? (
                  `${selectedDays} day${parseInt(selectedDays) !== 1 ? 's' : ''}`
                ) : (
                  duration.replace("_", " ")
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Budget:</span>
              <span className="font-medium text-white">
                {duration === "MULTIPLE_DAYS" && selectedDays ? (
                  `EGP ${budget.toLocaleString()}/day`
                ) : (
                  `EGP ${budget.toLocaleString()}`
                )}
              </span>
            </div>
            {shootSetting && (
              <div className="flex justify-between">
                <span className="text-gray-300">Shoot Setting:</span>
                <span className="font-medium text-white">{shootSetting.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            )}
            {shootLocation && (
              <div className="flex justify-between">
                <span className="text-gray-300">Location:</span>
                <span className="font-medium text-white">{shootLocation.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            What Happens Next?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm font-medium">1</span>
              </div>
              <div>
                <h3 className="font-medium text-white">We'll Review Your Request</h3>
                <p className="text-gray-300 text-sm">Our team will review your booking details and confirm availability.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm font-medium">2</span>
              </div>
              <div>
                <h3 className="font-medium text-white">Contact Within 24 Hours</h3>
                <p className="text-gray-300 text-sm">We'll reach out to you via phone, email, or WhatsApp to confirm details and discuss logistics.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-sm font-medium">3</span>
              </div>
              <div>
                <h3 className="font-medium text-white">Final Confirmation</h3>
                <p className="text-gray-300 text-sm">Once everything is confirmed, we'll send you a final booking confirmation with all details.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-700 rounded-xl p-6 mb-8 border border-gray-600">
          <h2 className="text-xl font-semibold text-white mb-4">Need Immediate Assistance?</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-400" />
              <span className="text-gray-200">+20 115 888 9002</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-gray-200">support@bokt.dev</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span className="text-gray-200">WhatsApp: +20 115 888 9002</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            href="/" 
            className="flex-1 bg-accent text-black text-center py-3 px-6 rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            Back to Home
          </Link>
          <Link 
            href="/models" 
            className="flex-1 bg-gray-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-gray-500 transition-colors"
          >
            Browse More Models
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Thank you for choosing Bokt! We're excited to help make your project a success.
          </p>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { bookingId, modelName, requesterName, startDate, duration, selectedDays, shootSetting, shootLocation, budget } = context.query;

  if (!bookingId || !modelName || !requesterName || !startDate || !duration || !budget) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      bookingId: bookingId as string,
      modelName: modelName as string,
      requesterName: requesterName as string,
      startDate: startDate as string,
      duration: duration as string,
      selectedDays: selectedDays as string | undefined,
      shootSetting: shootSetting as string | undefined,
      shootLocation: shootLocation as string | undefined,
      budget: parseInt(budget as string, 10),
    },
  };
};
