import { useState } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface Model {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  nickname: string;
  location: string;
  instagramHandle: string;
  gender: string;
  heightCm: number;
  shirtSize: string;
  pantSize: string;
  shoesSize: string;
  
  // Additional measurements
  bustCm: number;
  waistCm: number;
  
  // Personal details
  age: number;
  
  // Professional details
  categories: string[];
  modelingExperience: string;
  bio: string;
  
  photos: string[];
  createdAt: string;
  available: boolean;
  approved: boolean;
}

interface Props {
  models: Model[];
}

export default function AdminModels({ models }: Props) {
  const [modelList, setModelList] = useState<Model[]>(models);
  const [loading, setLoading] = useState<string | null>(null);

  const toggleAvailability = async (modelId: string, currentStatus: boolean) => {
    setLoading(modelId);
    try {
      const response = await fetch("/api/admin/toggle-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId, available: !currentStatus }),
      });

      if (response.ok) {
        setModelList(prev => 
          prev.map(model => 
            model.id === modelId 
              ? { ...model, available: !currentStatus }
              : model
          )
        );
      } else {
        alert("Failed to update availability");
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
      alert("Error updating availability");
    } finally {
      setLoading(null);
    }
  };

  const deleteModel = async (modelId: string, modelName: string) => {
    if (!confirm(`Are you sure you want to delete ${modelName}? This action cannot be undone.`)) {
      return;
    }

    setLoading(modelId);
    try {
      const response = await fetch("/api/admin/delete-model", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId }),
      });

      if (response.ok) {
        setModelList(prev => prev.filter(model => model.id !== modelId));
        alert("Model deleted successfully");
      } else {
        alert("Failed to delete model");
      }
    } catch (error) {
      console.error("Error deleting model:", error);
      alert("Error deleting model");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Model Management</h1>
              <p className="mt-2 text-muted-foreground">
                Manage approved models, control availability, and edit profiles
              </p>
            </div>
            <Link 
              href="/admin" 
              className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>

                 {/* Stats */}
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
           <div className="bg-white p-4 rounded-lg border">
             <div className="text-2xl font-bold text-foreground">{modelList.length}</div>
             <div className="text-sm text-muted-foreground">Total Models</div>
           </div>
           <div className="bg-white p-4 rounded-lg border">
             <div className="text-2xl font-bold text-blue-600">
               {modelList.filter(m => m.approved).length}
             </div>
             <div className="text-sm text-muted-foreground">Approved</div>
           </div>
           <div className="bg-white p-4 rounded-lg border">
             <div className="text-2xl font-bold text-yellow-600">
               {modelList.filter(m => !m.approved).length}
             </div>
             <div className="text-sm text-muted-foreground">Pending</div>
           </div>
           <div className="bg-white p-4 rounded-lg border">
             <div className="text-2xl font-bold text-green-600">
               {modelList.filter(m => m.available).length}
             </div>
             <div className="text-sm text-muted-foreground">Available</div>
           </div>
           <div className="bg-white p-4 rounded-lg border">
             <div className="text-2xl font-bold text-purple-600">
               {modelList.filter(m => m.gender === 'FEMALE').length}
             </div>
             <div className="text-sm text-muted-foreground">Female Models</div>
           </div>
         </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modelList.map((model) => (
            <div key={model.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              {/* Model Photo */}
              <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                {model.photos && model.photos.length > 0 ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={model.photos[0]}
                      alt={model.name}
                      className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                    />
                    {/* Photo count badge */}
                    {model.photos.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs font-medium px-2 py-1 rounded-full">
                        +{model.photos.length - 1}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📸</div>
                      <div className="text-sm">No Photo</div>
                    </div>
                  </div>
                )}
                                 <div className="absolute top-2 right-2 flex flex-col gap-1">
                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                     model.approved 
                       ? 'bg-blue-100 text-blue-800' 
                       : 'bg-yellow-100 text-yellow-800'
                   }`}>
                     {model.approved ? 'Approved' : 'Pending'}
                   </span>
                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                     model.available 
                       ? 'bg-green-100 text-green-800' 
                       : 'bg-red-100 text-red-800'
                   }`}>
                     {model.available ? 'Available' : 'Unavailable'}
                   </span>
                 </div>
              </div>

              {/* Model Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{model.nickname || model.name}</h3>
                    <p className="text-sm text-muted-foreground">{model.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    model.gender === 'FEMALE' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {model.gender}
                  </span>
                </div>

                                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Age:</span>
                     <span className="text-foreground">{model.age} years</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Location:</span>
                     <span className="text-foreground">{model.location}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Height:</span>
                     <span className="text-foreground">{model.heightCm}cm</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Measurements:</span>
                     <span className="text-foreground">
                       {model.bustCm > 0 ? `${model.bustCm}-${model.waistCm}` : 'N/A'}
                     </span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Pant Size:</span>
                     <span className="text-foreground">{model.pantSize || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Shoe Size:</span>
                     <span className="text-foreground">{model.shoesSize || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Experience:</span>
                     <span className="text-foreground">{model.modelingExperience}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Categories:</span>
                     <span className="text-foreground">{model.categories.join(', ')}</span>
                   </div>
                 </div>

                {/* Actions */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => toggleAvailability(model.id, model.available)}
                    disabled={loading === model.id}
                    className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      model.available
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } disabled:opacity-50`}
                  >
                    {loading === model.id ? 'Updating...' : 
                     model.available ? 'Set Unavailable' : 'Set Available'}
                  </button>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/models/${model.id}/edit`}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors text-center"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteModel(model.id, model.name)}
                      disabled={loading === model.id}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {modelList.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">No models found</div>
            <p className="text-muted-foreground mt-2">
              No model profiles exist in the database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }

  try {
    // Get all models with their photos (including pending and approved)
    const allModels = await prisma.modelProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        photos: {
          select: {
            url: true,
          },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { id: 'desc' },
    });

    // Transform the data for the frontend
    const models = allModels.map((model) => ({
      id: model.id,
      name: model.user.name || '',
      email: model.user.email,
      nickname: model.displayName || model.user.name || '',
      location: model.location || '',
      instagramHandle: model.instagramHandle || '',
      gender: model.gender || '',
      heightCm: model.heightCm || 0,
      shirtSize: model.shirtSize || '',
      pantSize: model.pantSize || '',
      shoesSize: model.shoesSize || '',
      
      // Additional measurements
      bustCm: model.bustCm || 0,
      waistCm: model.waistCm || 0,
      
      // Personal details
      age: model.age || 0,
      
      // Professional details
      categories: model.categories ? JSON.parse(model.categories) : [],
      modelingExperience: model.modelingExperience || '',
      bio: model.bio || '',
      
      photos: model.photos.map(photo => photo.url),
      createdAt: model.user.createdAt.toISOString(),
      available: model.available,
      approved: model.approved,
    }));

    return {
      props: {
        models,
      },
    };
  } catch (error) {
    console.error("Error fetching approved models:", error);
    return {
      props: {
        models: [],
      },
    };
  }
};
