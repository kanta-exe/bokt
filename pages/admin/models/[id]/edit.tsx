import { useState, useRef } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface Model {
  id: string;
  name: string;
  email: string;
  phone?: string;
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
  const [formData, setFormData] = useState({
    nickname: model.nickname,
    location: model.location,
    instagramHandle: model.instagramHandle,
    gender: model.gender,
    age: model.age,
    heightCm: model.heightCm,
    bustCm: model.bustCm,
    waistCm: model.waistCm,
    shirtSize: model.shirtSize,
    pantSize: model.pantSize,
    shoesSize: model.shoesSize,
    modelingExperience: model.modelingExperience,
    categories: model.categories,
    bio: model.bio,
    approved: model.approved,
    available: model.available,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isManagingPhotos, setIsManagingPhotos] = useState(false);
  const [settingMainIdx, setSettingMainIdx] = useState<number | null>(null);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/update-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: model.id,
          ...formData
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Model profile updated successfully!' });
        setIsEditing(false);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nickname: model.nickname,
      location: model.location,
      instagramHandle: model.instagramHandle,
      gender: model.gender,
      age: model.age,
      heightCm: model.heightCm,
      bustCm: model.bustCm,
      waistCm: model.waistCm,
      shirtSize: model.shirtSize,
      pantSize: model.pantSize,
      shoesSize: model.shoesSize,
      modelingExperience: model.modelingExperience,
      categories: model.categories,
      bio: model.bio,
      approved: model.approved,
      available: model.available,
    });
    setIsEditing(false);
    setMessage(null);
  };

  const handleAddPhotos = async (files: FileList) => {
    setIsUploadingPhotos(true);
    setMessage(null);

    try {
      const { supabase } = await import('@/lib/supabase');
      const slug = (model.nickname || model.name || 'model').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0,50);
      const urls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const ext = (f.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `models/${slug}_admin_${Date.now()}_${i}.${ext}`;
        const { error } = await supabase.storage.from('photos').upload(path, f, { upsert: false, cacheControl: '3600', contentType: f.type || undefined });
        if (error) {
          setMessage({ type: 'error', text: error.message || 'Upload failed' });
          setIsUploadingPhotos(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path);
        urls.push(publicUrl);
      }

      const resp = await fetch('/api/admin/save-photo-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: model.id, urls }),
      });

      const result = await resp.json();
      if (resp.ok) {
        setMessage({ type: 'success', text: result.message });
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save photos' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'An error occurred while uploading photos' });
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = async (photoIndex: number) => {
    setIsRemovingPhoto(photoIndex);
    setMessage(null);

    try {
      console.log('Removing photo at index:', photoIndex);
      const response = await fetch(`/api/admin/manage-photos?modelId=${model.id}&photoIndex=${photoIndex}`, {
        method: 'DELETE',
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        // Refresh the page to show updated photos
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to remove photo' });
      }
    } catch (error) {
      console.error('Error removing photo:', error);
      setMessage({ type: 'error', text: 'An error occurred while removing photo' });
    } finally {
      setIsRemovingPhoto(null);
    }
  };

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

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Model Info */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  {isEditing ? 'Cancel Edit' : 'Edit'}
                </button>
              </div>
              
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
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
                  <p className="text-foreground">{model.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Nickname</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => handleInputChange('nickname', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-foreground">{formData.nickname}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-foreground">{formData.location}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Instagram</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.instagramHandle}
                      onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-foreground">{formData.instagramHandle}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Physical Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">Physical Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Gender</label>
                  {isEditing ? (
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="FEMALE">Female</option>
                      <option value="MALE">Male</option>
                      <option value="NON_BINARY">Non-Binary</option>
                    </select>
                  ) : (
                    <p className="text-foreground">{formData.gender}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Age</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-foreground">{formData.age} years</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Height (cm)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.heightCm}
                      onChange={(e) => handleInputChange('heightCm', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-foreground">{formData.heightCm}cm</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Bust (cm)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.bustCm}
                      onChange={(e) => handleInputChange('bustCm', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-foreground">{formData.bustCm}cm</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Waist (cm)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.waistCm}
                      onChange={(e) => handleInputChange('waistCm', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-foreground">{formData.waistCm}cm</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Shirt Size</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.shirtSize}
                      onChange={(e) => handleInputChange('shirtSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-foreground">{formData.shirtSize}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Pant Size (EU)</label>
                  {isEditing ? (
                    <select
                      value={formData.pantSize}
                      onChange={(e) => handleInputChange('pantSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select size</option>
                      <option value="26">26</option>
                      <option value="28">28</option>
                      <option value="30">30</option>
                      <option value="32">32</option>
                      <option value="34">34</option>
                      <option value="36">36</option>
                      <option value="38">38</option>
                      <option value="40">40</option>
                      <option value="42">42</option>
                      <option value="44">44</option>
                      <option value="46">46</option>
                      <option value="48">48</option>
                      <option value="50">50</option>
                    </select>
                  ) : (
                    <p className="text-foreground">{formData.pantSize || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Shoe Size</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.shoesSize}
                      onChange={(e) => handleInputChange('shoesSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-foreground">{formData.shoesSize}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Professional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Modeling Experience</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.modelingExperience}
                    onChange={(e) => handleInputChange('modelingExperience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-foreground">{formData.modelingExperience}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Categories</label>
                {isEditing ? (
                  <div className="space-y-2">
                    {['FASHION', 'COMMERCIAL', 'FITNESS', 'BEAUTY', 'RUNWAY', 'EDITORIAL'].map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category)}
                          onChange={(e) => handleCategoryChange(category, e.target.checked)}
                          className="mr-2"
                        />
                        {category}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-foreground">{formData.categories.join(', ')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Bio</h2>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-foreground">{formData.bio || 'No bio provided'}</p>
            )}
          </div>

          {/* Status */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Approval Status</label>
                {isEditing ? (
                  <select
                    value={formData.approved ? 'approved' : 'pending'}
                    onChange={(e) => handleInputChange('approved', e.target.value === 'approved')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.approved 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formData.approved ? 'Approved' : 'Pending Approval'}
                  </span>
                )}
              </div>
              <div>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/admin/update-model', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ modelId: model.id, approved: !formData.approved })
                      });
                      window.location.reload();
                    } catch {}
                  }}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${formData.approved ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                  {formData.approved ? 'Hide from site' : 'Unhide on site'}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Availability</label>
                {isEditing ? (
                  <select
                    value={formData.available ? 'available' : 'unavailable'}
                    onChange={(e) => handleInputChange('available', e.target.value === 'available')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {formData.available ? 'Available' : 'Unavailable'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Photos ({model.photos.length})</h2>
              <div className="text-xs text-gray-500">Debug: Managing Photos = {isManagingPhotos ? 'true' : 'false'}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('Manage Photos clicked, current state:', isManagingPhotos);
                    setIsManagingPhotos(!isManagingPhotos);
                  }}
                  className="px-3 py-1 text-sm bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
                >
                  {isManagingPhotos ? 'Cancel' : 'Manage Photos'}
                </button>
                {isManagingPhotos && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhotos}
                    className="px-3 py-1 text-sm bg-accent text-black rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {isUploadingPhotos ? 'Uploading...' : 'Add Photos'}
                  </button>
                )}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleAddPhotos(e.target.files);
                }
              }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {model.photos.map((photo, index) => (
                <div key={index} className="relative group overflow-hidden rounded-lg shadow-md transition-all duration-200 hover:shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full aspect-[3/4] object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  {/* Photo number overlay */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {index + 1}
                  </div>
                  {/* Set as main */}
                  <button
                    onClick={async () => {
                      setSettingMainIdx(index);
                      try {
                        await fetch('/api/admin/update-model', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ modelId: model.id, avatarUrl: photo })
                        });
                        window.location.reload();
                      } finally {
                        setSettingMainIdx(null);
                      }
                    }}
                    className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-medium px-3 py-2 rounded hover:bg-black/80 transition-colors z-20"
                  >
                    {settingMainIdx === index ? 'Setting…' : 'Set as main'}
                  </button>
                  
                                     {/* Remove button (only show when managing photos) */}
                   {isManagingPhotos && (
                     <button
                       onClick={() => {
                         console.log('Remove button clicked for photo index:', index);
                         console.log('isManagingPhotos state:', isManagingPhotos);
                         handleRemovePhoto(index);
                       }}
                       disabled={isRemovingPhoto === index}
                       className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-3 py-2 rounded hover:bg-red-600 transition-colors disabled:opacity-50 z-20 cursor-pointer"
                       style={{ minWidth: '60px', minHeight: '24px' }}
                     >
                       {isRemovingPhoto === index ? 'Removing...' : 'Remove'}
                     </button>
                   )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 pointer-events-none z-10" />
                </div>
              ))}
            </div>
            
            {model.photos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg">
                <p>No photos uploaded</p>
                {isManagingPhotos && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhotos}
                    className="mt-2 px-4 py-2 bg-accent text-black rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {isUploadingPhotos ? 'Uploading...' : 'Add First Photo'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
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
            phone: true,
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
      phone: modelProfile.user.phone || undefined,
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
