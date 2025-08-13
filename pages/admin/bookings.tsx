import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { useState } from "react";
import Link from "next/link";

interface Booking {
  id: string;
  startAt: string;
  duration: string;
  note: string;
  requesterName: string;
  requesterPhone: string;
  requesterBrand: string | null;
  requesterEmail: string | null;
  contactWhatsApp: boolean;
  brandWebsite: string | null;
  brandInstagram: string | null;
  offeredBudgetEgp: number;
  status: string;
  createdAt: string;
  model: {
    id: string;
    displayName: string;
    user: {
      email: string;
    };
  };
}

export default function AdminBookings({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState("all");
  const [bookingsList, setBookingsList] = useState(bookings);
  const [loading, setLoading] = useState<string | null>(null);

  const filteredBookings = bookingsList.filter(booking => {
    if (filter === "all") return true;
    if (filter === "pending") return booking.status === "PENDING";
    if (filter === "confirmed") return booking.status === "CONFIRMED";
    if (filter === "cancelled") return booking.status === "CANCELLED";
    return true;
  });

  const handleConfirmBooking = async (bookingId: string) => {
    setLoading(bookingId);
    try {
      const response = await fetch("/api/admin/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      if (response.ok) {
        setBookingsList(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: "CONFIRMED" }
              : booking
          )
        );
        alert("Booking confirmed successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to confirm booking");
    } finally {
      setLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const reason = prompt("Please provide a reason for cancellation (optional):");
    if (reason === null) return; // User cancelled the prompt
    
    setLoading(bookingId);
    try {
      const response = await fetch("/api/admin/cancel-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, reason }),
      });

      if (response.ok) {
        setBookingsList(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: "CANCELLED" }
              : booking
          )
        );
        alert("Booking cancelled successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to cancel booking");
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Booking Management</h1>
        <Link 
          href="/admin" 
          className="px-4 py-2 bg-accent text-black rounded-md hover:bg-accent/90 transition-colors font-medium"
        >
          Back to Admin
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-foreground">{bookingsList.length}</div>
          <div className="text-sm text-muted-foreground">Total Bookings</div>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-foreground">
            {bookingsList.filter(b => b.status === "PENDING").length}
          </div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-foreground">
            {bookingsList.filter(b => b.status === "CONFIRMED").length}
          </div>
          <div className="text-sm text-muted-foreground">Confirmed</div>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-foreground">
            {bookingsList.filter(b => b.status === "CANCELLED").length}
          </div>
          <div className="text-sm text-muted-foreground">Cancelled</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-border bg-muted text-foreground rounded-md focus:border-accent focus:ring-accent focus:bg-background"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No bookings found
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-background border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {booking.requesterName} → {booking.model.displayName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(booking.startAt)} • {booking.duration.replace("_", " ")}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-muted-foreground">Phone:</span> {booking.requesterPhone}</div>
                    {booking.requesterEmail && (
                      <div><span className="text-muted-foreground">Email:</span> {booking.requesterEmail}</div>
                    )}
                    <div><span className="text-muted-foreground">WhatsApp:</span> {booking.contactWhatsApp ? "Yes" : "No"}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Brand Information</h4>
                  <div className="space-y-1 text-sm">
                    {booking.requesterBrand && (
                      <div><span className="text-muted-foreground">Brand:</span> {booking.requesterBrand}</div>
                    )}
                    {booking.brandWebsite && (
                      <div><span className="text-muted-foreground">Website:</span> {booking.brandWebsite}</div>
                    )}
                    {booking.brandInstagram && (
                      <div><span className="text-muted-foreground">Instagram:</span> {booking.brandInstagram}</div>
                    )}
                    <div><span className="text-muted-foreground">Budget:</span> EGP {booking.offeredBudgetEgp.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {booking.note && (
                <div className="mb-4">
                  <h4 className="font-medium text-foreground mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {booking.note}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>Model: {booking.model.user.email}</div>
                <div>Created: {formatDate(booking.createdAt)}</div>
              </div>

              {/* Action Buttons */}
              {booking.status === "PENDING" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleConfirmBooking(booking.id)}
                    disabled={loading === booking.id}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === booking.id ? "Confirming..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={loading === booking.id}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === booking.id ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  try {
    const bookings = await prisma.booking.findMany({
      include: {
        model: {
          select: {
            id: true,
            displayName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      props: {
        bookings: bookings.map((booking) => ({
          ...booking,
          startAt: booking.startAt.toISOString(),
          createdAt: booking.createdAt.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return {
      props: {
        bookings: [],
      },
    };
  }
};
