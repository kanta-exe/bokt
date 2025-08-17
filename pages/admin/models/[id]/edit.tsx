import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface Model {
  id: string;
  name: string;
  email: string;
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
  available: boolean;
  approved: boolean;
}

interface Props {
  model: Model;
}

export default function EditModel({ model }: Props) {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Edit Model</h1>
              <p className="mt-2 text-muted-foreground">
                Edit profile for {model.nickname || model.name}
              </p>
            </div>
            <Link 
              href="/admin/models" 
              className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
            >
              ← Back to Models
            </Link>
          </div>
        </div>

        {/* Model Info */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                  <p className="text-foreground font-medium">{model.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                  <p className="text-foreground">{model.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Nickname</label>
                  <p className="text-foreground">{model.nickname}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                  <p className="text-foreground">{model.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Instagram</label>
                  <p className="text-foreground">{model.instagramHandle}</p>
                </div>
              </div>
            </div>

            {/* Physical Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">Physical Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Gender</label>
                  <p className="text-foreground">{model.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Age</label>
                  <p className="text-foreground">{model.age} years</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Height</label>
                  <p className="text-foreground">{model.heightCm}cm</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Measurements</label>
                  <p className="text-foreground">
                    Bust: {model.bustCm || 'N/A'}cm | Waist: {model.waistCm || 'N/A'}cm
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Sizes</label>
                  <p className="text-foreground">Shirt: {model.shirtSize} | Pants: {model.pantSize} | Shoes: {model.shoesSize}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Experience</label>
                  <p className="text-foreground">{model.modelingExperience}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Categories</label>
                  <p className="text-foreground">{model.categories.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Bio</h2>
            <p className="text-foreground">{model.bio || 'No bio provided'}</p>
          </div>

          {/* Photos */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Photos ({model.photos.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {model.photos.map((photo, index) => (
                <div key={index} className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Status</h2>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                model.available 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {model.available ? 'Available' : 'Unavailable'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                model.approved 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {model.approved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
              Edit Profile (Coming Soon)
            </button>
            <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors">
              Manage Photos (Coming Soon)
            </button>
          </div>
        </div>
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

  const { id } = ctx.params as { id: string };

  try {
    const modelProfile = await prisma.modelProfile.findUnique({
      where: { id },
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
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!modelProfile) {
      return { notFound: true };
    }

    const model = {
      id: modelProfile.id,
      name: modelProfile.user.name || '',
      email: modelProfile.user.email,
      nickname: modelProfile.displayName || modelProfile.user.name || '',
      location: modelProfile.location || '',
      instagramHandle: modelProfile.instagramHandle || '',
      gender: modelProfile.gender || '',
      heightCm: modelProfile.heightCm || 0,
      shirtSize: modelProfile.shirtSize || '',
      pantSize: modelProfile.pantSize || '',
      shoesSize: modelProfile.shoesSize || '',
      
      // Additional measurements
      bustCm: modelProfile.bustCm || 0,
      waistCm: modelProfile.waistCm || 0,
      
      // Personal details
      age: modelProfile.age || 0,
      
      // Professional details
      categories: modelProfile.categories ? JSON.parse(modelProfile.categories) : [],
      modelingExperience: modelProfile.modelingExperience || '',
      bio: modelProfile.bio || '',
      
      photos: modelProfile.photos.map(photo => photo.url),
      available: modelProfile.available,
      approved: modelProfile.approved,
    };

    return {
      props: {
        model,
      },
    };
  } catch (error) {
    console.error("Error fetching model:", error);
    return { notFound: true };
  }
};
