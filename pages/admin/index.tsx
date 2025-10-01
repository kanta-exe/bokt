import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import Tabs from "@/components/Tabs";
import { useState } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface PendingModel {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  nickname?: string;
  location: string;
  instagramHandle: string;
  gender: string;
  heightCm: number | null;
  shirtSize: string;
  pantSize: string;
  shoesSize: string;
  categories: string[];
  modelingExperience: string;
  bio: string;
  photos: string[];
  createdAt: string;
}

export default function AdminPage({ pending }: { pending: PendingModel[] }) {
  const [items, setItems] = useState(pending || []);
  const [selectedModel, setSelectedModel] = useState<PendingModel | null>(null);
  
  async function approve(id: string) {
    const res = await fetch("/api/admin/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) {
      setItems((prev) => prev.filter((m) => m.id !== id));
      setSelectedModel(null);
    }
  }

  async function reject(id: string) {
    const reason = prompt("Please provide a reason for rejection (optional):");
    
    const res = await fetch("/api/admin/reject", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ id, reason }) 
    });
    
    if (res.ok) {
      setItems((prev) => prev.filter((m) => m.id !== id));
      setSelectedModel(null);
      alert("Application rejected successfully");
    } else {
      const error = await res.json();
      alert(`Error rejecting application: ${error.error}`);
    }
  }

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link 
            href="/admin/bookings" 
            className="px-4 py-2 bg-accent text-black rounded-md hover:bg-accent/90 transition-colors font-medium"
          >
            View Bookings
          </Link>
          <Link 
            href="/admin/models" 
            className="px-4 py-2 bg-accent text-black rounded-md hover:bg-accent/90 transition-colors font-medium"
          >
            Manage Approved Models
          </Link>
        </div>
      </div>
      <Tabs tabs={[{ id: "approve", label: `Pending Applications (${items.length})` }]} />
      
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Applications List */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Model Applications</h2>
          <div className="space-y-3">
            {items.map((m) => (
              <div 
                key={m.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedModel?.id === m.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent'
                }`}
                onClick={() => setSelectedModel(m)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{m.name}</h3>
                    <p className="text-sm text-muted-foreground">{m.email}</p>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <span>📸 {m.photos.length} photos</span>
                      <span className="ml-3">📱 {m.instagramHandle}</span>
                      <span className="ml-3">📍 {m.location}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <span>👕 {m.shirtSize} | 👖 {m.pantSize} | 👟 {m.shoesSize}</span>
                      {m.heightCm && <span className="ml-3">📏 {m.heightCm}cm</span>}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <span>🎯 {m.categories.join(', ')}</span>
                      <span className="ml-3">👤 {m.gender}</span>
                      <span className="ml-3">⭐ {m.modelingExperience}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {!items.length && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No pending applications</p>
                <p className="text-sm mt-1">All caught up! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Application Details */}
        <div>
          {selectedModel ? (
            <div className="border border-border rounded-lg p-6 bg-background">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Application Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-foreground">{selectedModel.name}</p>
                </div>
                
                {selectedModel.nickname && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nickname</label>
                    <p className="text-foreground">{selectedModel.nickname}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{selectedModel.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-foreground">{selectedModel.phone || 'Not provided (old application)'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-foreground">{selectedModel.location}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Instagram</label>
                  <p className="text-foreground">{selectedModel.instagramHandle}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="text-foreground">{selectedModel.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Height</label>
                    <p className="text-foreground">{selectedModel.heightCm ? `${selectedModel.heightCm}cm` : 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Shirt Size</label>
                    <p className="text-foreground">{selectedModel.shirtSize}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pant Size (EU)</label>
                    <p className="text-foreground">{selectedModel.pantSize}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Shoe Size</label>
                    <p className="text-foreground">{selectedModel.shoesSize}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Categories</label>
                  <p className="text-foreground">{selectedModel.categories.join(', ')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Modeling Experience</label>
                  <p className="text-foreground">{selectedModel.modelingExperience}</p>
                </div>
                
                {selectedModel.bio && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="text-foreground text-sm leading-relaxed">{selectedModel.bio}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Photos ({selectedModel.photos.length})</label>
                  <div className="mt-2">
                    {selectedModel.photos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedModel.photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            {/* Try to show actual photo first */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={photo} 
                              alt={`Photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-border transition-all duration-200 group-hover:scale-105"
                              onError={(e) => {
                                // If image fails to load, show placeholder
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                              onLoad={(e) => {
                                // If image loads successfully, hide placeholder
                                const target = e.target as HTMLImageElement;
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'none';
                              }}
                            />
                            {/* Fallback placeholder if photo fails to load */}
                            <div 
                              className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg border border-border flex flex-col items-center justify-center text-white text-center p-2"
                            >
                              <div className="text-2xl mb-1">📸</div>
                              <div className="text-xs font-medium">Photo {index + 1}</div>
                              <div className="text-xs opacity-80 mt-1">Loading...</div>
                            </div>
                            
                            {/* Show photo URL info on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="text-white text-xs text-center p-2">
                                <div className="font-medium">Photo {index + 1}</div>
                                <div className="break-all">
                                  {photo.length > 50 ? photo.substring(0, 50) + '...' : photo}
                                </div>
                                <div className="mt-1 text-xs opacity-80">
                                  {photo.startsWith('https://') && photo.includes('supabase.co') ? '☁️ Supabase' : 
                                   photo.startsWith('/uploads/') ? '📁 Local file' : 
                                   photo.includes('placeholder.com') ? '🖼️ Placeholder' : '🌐 External URL'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg">
                        <p>No photos uploaded</p>
                        <p className="text-sm mt-1">This application was submitted without photos</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Photo URLs for debugging */}
                  {selectedModel.photos.length > 0 && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-2">Photo URLs (for reference):</div>
                      <div className="space-y-1">
                        {selectedModel.photos.map((photo, index) => (
                          <div key={index} className="text-xs font-mono break-all">
                            <span className="text-accent">[{index + 1}]</span> {photo}
                            {photo.startsWith('https://') && photo.includes('supabase.co') && (
                              <span className="ml-2 text-blue-600">☁️ Supabase</span>
                            )}
                            {photo.startsWith('/uploads/') && (
                              <span className="ml-2 text-green-600">📁 Local file</span>
                            )}
                            {photo.includes('placeholder.com') && (
                              <span className="ml-2 text-blue-600">🖼️ Placeholder</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Applied</label>
                  <p className="text-foreground">{new Date(selectedModel.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => approve(selectedModel.id)} 
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium transition-colors"
                >
                  Approve Application
                </button>
                <button 
                  onClick={() => reject(selectedModel.id)} 
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium transition-colors"
                >
                  Reject Application
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-lg p-6 text-center text-muted-foreground bg-background">
              <p>Select an application to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  console.log('🔒 Admin getServerSideProps - checking session...');
  
  try {
    // Get the session
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    
    console.log('🔒 Session check result:', {
      sessionExists: !!session,
      sessionData: session ? {
        user: session.user ? {
          id: (session.user as any)?.id,
          email: session.user.email,
          role: (session.user as any)?.role
        } : null,
        expires: session.expires
      } : null,
      cookies: ctx.req.headers.cookie ? 'Cookies present' : 'No cookies',
      userAgent: ctx.req.headers['user-agent']?.substring(0, 50) + '...'
    });
    
    // Check if session exists and user has ADMIN role
    if (!session) {
      console.log('❌ No session found - redirecting to signin');
      return { 
        redirect: { 
          destination: "/auth/signin?callbackUrl=/admin", 
          permanent: false 
        } 
      };
    }
    
    if (!(session.user as any)?.role) {
      console.log('❌ No role found in session - redirecting to signin');
      return { 
        redirect: { 
          destination: "/auth/signin?callbackUrl=/admin", 
          permanent: false 
        } 
      };
    }
    
    if ((session.user as any)?.role !== "ADMIN") {
      console.log('❌ User role is not ADMIN - redirecting to home');
      return { 
        redirect: { 
          destination: "/", 
          permanent: false 
        } 
      };
    }
    
    console.log('✅ Admin access granted for user:', (session.user as any)?.email);
    
    // Query for pending model applications
    
    try {
      const pendingModels = await prisma.modelProfile.findMany({
        where: {
          approved: false,
          user: {
            role: 'MODEL'
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true
            }
          },
          photos: {
            select: {
              id: true,
              url: true,
              caption: true
            }
          }
        },
        orderBy: {
          user: {
            createdAt: 'desc'
          }
        }
      });
      
      console.log(`📊 Found ${pendingModels.length} pending model applications`);
      
      // Debug: Log the first model to see what we're getting
      if (pendingModels.length > 0) {
        console.log('🔍 First pending model data:', JSON.stringify(pendingModels[0], null, 2));
      }
      
      // Transform the data to match our PendingModel interface
      const pending: PendingModel[] = pendingModels.map((model: any) => ({
        id: model.id,
        name: model.user.name || 'Unknown',
        email: model.user.email,
        phone: model.user.phone || null,
        nickname: model.displayName || undefined,
        location: model.location || 'Unknown',
        instagramHandle: model.instagramHandle || 'N/A',
        gender: model.gender || 'Unknown',
        heightCm: model.heightCm,
        shirtSize: model.shirtSize || 'N/A',
        pantSize: model.pantSize || 'N/A',
        shoesSize: model.shoesSize || 'N/A',
        categories: model.categories ? JSON.parse(model.categories) : [],
        modelingExperience: model.modelingExperience || 'Unknown',
        bio: model.bio || '',
        photos: model.photos && model.photos.length > 0 ? model.photos.map((photo: any) => photo.url) : [],
        createdAt: model.user.createdAt.toISOString()
      }));
      
      console.log(`📊 Returning ${pending.length} pending models`);
      if (pending.length > 0) {
        console.log('🔍 First transformed model:', JSON.stringify(pending[0], null, 2));
      }
      
      return { props: { pending } };
      
    } catch (dbError) {
      console.error('💥 Database error in admin getServerSideProps:', dbError);
      return { props: { pending: [] } };
    }
    
  } catch (error) {
    console.error('💥 Error in admin getServerSideProps:', error);
    console.error('💥 Error details:', {
      name: (error as any).name,
      message: (error as any).message,
      stack: (error as any).stack?.substring(0, 200) + '...'
    });
    
    // On error, redirect to signin instead of home
    return { 
      redirect: { 
        destination: "/auth/signin?callbackUrl=/admin", 
        permanent: false 
      } 
    };
  }
};