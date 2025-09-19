import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ModelCategory, Gender } from "@/generated/prisma";
import { InputField, SelectField, TextAreaField } from "@/components/FormField";
import { useFormValidation } from "@/lib/form-validation";

interface ApplicationForm {
  // Basic Info
  name: string;
  email: string;
  nickname: string;
  location: string;
  instagramHandle: string;
  
  // Physical Attributes
  gender: string;
  heightCm: number;
  shirtSize: string;
  pantSize: string;
  shoesSize: string;
  
  // Additional Measurements
  bustCm: number;
  waistCm: number;
  
  // Personal Details
  age: number;
  
  // Professional Info
  categories: string[];
  modelingExperience: string;
  bio: string;
  
  // Photos
  photos: File[];
  
  // Terms
  termsAccepted: boolean;
}

export default function ModelApplication() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<ApplicationForm>({
    name: "",
    email: "",
    nickname: "",
    location: "",
    instagramHandle: "",
    gender: "",
    heightCm: 0,
    shirtSize: "",
    pantSize: "",
    shoesSize: "",
    
    // Additional Measurements
    bustCm: 0,
    waistCm: 0,
    
    // Personal Details
    age: 0,
    
    // Professional Info
    categories: [],
    modelingExperience: "",
    bio: "",
    
    photos: [],
    termsAccepted: false,
  });
  
  const [loading, setLoading] = useState(false);
  const { validator, clearErrors, clearFieldError, setFieldError, getFieldError } = useFormValidation();

  const updateForm = (updates: Partial<ApplicationForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    Object.keys(updates).forEach(field => {
      clearFieldError(field);
    });
  };



  const validateStep = (step: number): boolean => {
    clearErrors();
    let isValid = true;

    switch (step) {
      case 1:
        // Validate basic info
        if (!form.name.trim()) {
          setFieldError('name', 'Full name is required');
          isValid = false;
        }
        if (!form.email.trim()) {
          setFieldError('email', 'Email is required');
          isValid = false;
        } else if (!validator.validateEmail(form.email)) {
          setFieldError('email', 'Please enter a valid email address');
          isValid = false;
        }
        if (!form.location.trim()) {
          setFieldError('location', 'City is required');
          isValid = false;
        }
        if (!form.instagramHandle.trim()) {
          setFieldError('instagramHandle', 'Instagram handle is required');
          isValid = false;
        } else if (!validator.validateInstagramHandle(form.instagramHandle)) {
          setFieldError('instagramHandle', 'Instagram handle can only contain lowercase letters, underscores (_), and dots (.). No numbers or special characters allowed.');
          isValid = false;
        }
        break;

      case 2:
        // Validate physical attributes
        if (!form.gender) {
          setFieldError('gender', 'Gender is required');
          isValid = false;
        }
        if (!form.age || form.age < 16 || form.age > 80) {
          setFieldError('age', 'Age must be between 16 and 80');
          isValid = false;
        }
        if (!form.heightCm || form.heightCm < 100 || form.heightCm > 250) {
          setFieldError('heightCm', 'Height must be between 100 and 250 cm');
          isValid = false;
        }
        if (!form.shirtSize) {
          setFieldError('shirtSize', 'Shirt size is required');
          isValid = false;
        }
        if (!form.pantSize) {
          setFieldError('pantSize', 'Pant size is required');
          isValid = false;
        }
        if (!form.shoesSize) {
          setFieldError('shoesSize', 'Shoes size is required');
          isValid = false;
        }
        break;

      case 3:
        // Validate professional info
        if (form.categories.length === 0) {
          setFieldError('categories', 'Please select at least one modeling category');
          isValid = false;
        }
        if (!form.modelingExperience) {
          setFieldError('modelingExperience', 'Modeling experience is required');
          isValid = false;
        }
        if (form.photos.length < 5) {
          setFieldError('photos', 'Please upload exactly 5 photos');
          isValid = false;
        } else if (form.photos.length > 5) {
          setFieldError('photos', 'Please upload exactly 5 photos');
          isValid = false;
        }
        break;

      case 4:
        // Validate terms
        if (!form.termsAccepted) {
          setFieldError('termsAccepted', 'You must accept the terms and conditions');
          isValid = false;
        }
        break;

      default:
        isValid = false;
    }

    return isValid;
  };

  const nextStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    
    console.log('Next step clicked, current step:', currentStep);
    console.log('Form data:', form);
    
    // Always validate the current step first
    const isValid = validateStep(currentStep);
    console.log('Validation result:', isValid);
    
    if (isValid) {
      // If validation passes, move to next step
      setCurrentStep(prev => Math.min(prev + 1, 4));
      clearErrors();
    } else {
      console.log('Validation failed, errors should be set');
    }
    // If validation fails, errors are already set by validateStep
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    clearErrors();
  };

  const isFormComplete = (): boolean => {
    const complete = !!(
      form.name && 
      form.email && 
      form.location && 
      form.instagramHandle &&
      form.gender && 
      form.heightCm > 0 && 
      form.shirtSize && 
      form.pantSize && 
      form.shoesSize &&
      form.categories.length > 0 && 
      form.modelingExperience && 
             form.photos.length === 5 &&
      form.termsAccepted
    );
    console.log('Form completion check:', { complete, form });
    return complete;
  };

  const compressImage = async (file: File): Promise<File> => {
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      
      // Skip compression on mobile devices to avoid issues
      if (isMobile) {
        console.log('📱 Skipping compression on mobile device:', file.name);
        return file;
      }
      
      // Check if createImageBitmap is supported
      if (typeof createImageBitmap === 'undefined') {
        console.log('⚠️ createImageBitmap not supported, using original file');
        return file;
      }
      
      const imageBitmap = await createImageBitmap(file);
      const maxDim = 2000;
      const scale = Math.min(1, maxDim / Math.max(imageBitmap.width, imageBitmap.height));
      const targetW = Math.round(imageBitmap.width * scale);
      const targetH = Math.round(imageBitmap.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.drawImage(imageBitmap, 0, 0, targetW, targetH);
      
      // Use JPEG instead of WebP for better mobile compatibility
      const format = isIOS ? 'image/jpeg' : 'image/webp';
      const quality = 0.8;
      
      const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, format, quality));
      if (!blob) return file;
      
      const extension = isIOS ? '.jpg' : '.webp';
      const newFile = new File([blob], file.name.replace(/\.[^.]+$/, extension), { type: format });
      return newFile;
    } catch (error) {
      console.warn('⚠️ Compression failed, using original file:', error);
      return file;
    }
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const maxSize = 50 * 1024 * 1024; // 50MB limit per file (Supabase)
    
    // Validate file count
    if (form.photos.length + fileArray.length > 5) {
      setFieldError('photos', 'Maximum 5 photos allowed');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setFieldError('photos', 'Only JPEG, PNG, and WebP files are allowed');
      return;
    }
    
    // Compress images client-side in parallel to speed up uploads
    // Use sequential processing on mobile to avoid memory issues
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let compressedFiles: File[];
    if (isMobile) {
      console.log('📱 Using sequential compression on mobile');
      compressedFiles = [];
      for (const file of fileArray) {
        const compressed = await compressImage(file);
        compressedFiles.push(compressed);
      }
    } else {
      compressedFiles = await Promise.all(
        fileArray.map(file => compressImage(file))
      );
    }

    // Validate file sizes after compression (consolidated)
    const currentTotalSize = form.photos.reduce((total, file) => total + file.size, 0);
    const newTotalSize = currentTotalSize + compressedFiles.reduce((total, file) => total + file.size, 0);
    const maxTotalSize = 250 * 1024 * 1024; // 250MB total
    
    // Check individual file sizes
    const oversizedFiles = compressedFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setFieldError('photos', `Photo(s) ${oversizedFiles.map((_, i) => i + 1).join(', ')} are too large. Maximum file size is 50MB per photo.`);
      return;
    }
    
    // Check total size
    if (newTotalSize > maxTotalSize) {
      setFieldError('photos', `Total photo size would exceed 250MB limit. Please select smaller photos.`);
      return;
    }
    
    updateForm({ photos: [...form.photos, ...compressedFiles] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Form submit triggered');
    e.preventDefault();
    
    // Final validation before submission
    if (!validateStep(currentStep)) {
      return;
    }

    // Check total file size (max 250MB for all photos combined)
    const totalSize = form.photos.reduce((total, file) => total + file.size, 0);
    const maxTotalSize = 250 * 1024 * 1024; // 250MB total
    
    if (totalSize > maxTotalSize) {
      setFieldError('photos', `Total photo size (${(totalSize / 1024 / 1024).toFixed(1)}MB) exceeds limit. Maximum total size is 250MB.`);
      return;
    }

    setLoading(true);
    clearErrors();
    
    // Show compression progress
    console.log('📸 Compressing and uploading photos...');
    console.log('📱 Device info:', {
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      photosCount: form.photos.length,
      totalSize: `${(form.photos.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(1)}MB`
    });

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('nickname', form.nickname);
      formData.append('location', form.location);
      formData.append('instagramHandle', form.instagramHandle);
      formData.append('gender', form.gender);
      formData.append('heightCm', form.heightCm.toString());
      formData.append('shirtSize', form.shirtSize);
      formData.append('pantSize', form.pantSize);
      formData.append('shoesSize', form.shoesSize);
      
      // Additional measurements
      formData.append('bustCm', form.bustCm.toString());
      formData.append('waistCm', form.waistCm.toString());
      
      // Personal details
      formData.append('age', form.age.toString());
      
      // Professional info
      formData.append('categories', JSON.stringify(form.categories));
      formData.append('modelingExperience', form.modelingExperience);
      formData.append('bio', form.bio);
      formData.append('termsAccepted', form.termsAccepted.toString());
      
      // Append photos - ensure proper handling for mobile
      form.photos.forEach((photo, index) => {
        // Create a fresh File object to avoid mobile corruption issues
        const freshFile = new File([photo], photo.name, { type: photo.type });
        formData.append(`photos`, freshFile);
      });

      // Add timeout for mobile devices (2 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes
      
      console.log('🚀 Starting upload to server...');
      console.log('📊 FormData contents:', {
        fieldCount: Array.from(formData.keys()).length,
        hasPhotos: formData.has('photos'),
        photoCount: form.photos.length
      });

      const res = await fetch("/api/auth/model-register", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log('📡 Server response received:', res.status, res.statusText);

      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      if (res.ok) {
        console.log('Redirecting to success page...');
        window.location.href = "/auth/application-success";
      } else {
        let errorMessage = "Failed to submit application. Please try again.";
        
                 if (res.status === 413) {
          try {
            const errorData = await res.json();
            const details = errorData?.details || errorData?.error;
            setFieldError('photos', details || 'Photos are too large. Max 50MB per photo, 250MB total.');
          } catch {
            setFieldError('photos', 'Photos are too large. Max 50MB per photo, 250MB total.');
          }
        } else if (res.status === 502 || res.status === 503) {
          setFieldError('general', 'Server is temporarily unavailable. Please try again in a few minutes.');
        } else {
          try {
            const errorData = await res.json();
            errorMessage = errorData.error || errorMessage;
            
            // Try to map server errors to specific fields
            if (errorMessage.toLowerCase().includes('email')) {
              setFieldError('email', errorMessage);
            } else if (errorMessage.toLowerCase().includes('instagram')) {
              setFieldError('instagramHandle', errorMessage);
            } else if (errorMessage.toLowerCase().includes('photos')) {
              setFieldError('photos', errorMessage);
            } else {
              setFieldError('general', errorMessage);
            }
          } catch (parseError) {
            // If response is not JSON, use status text
            setFieldError('general', `Server error: ${res.status} ${res.statusText}`);
          }
        }
        
        console.log('Error response:', { status: res.status, message: errorMessage });
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      
      // Handle specific mobile errors
      if (err.name === 'AbortError') {
        setFieldError('general', 'Upload timed out. Please try again with smaller photos or better internet connection.');
      } else if (err.message?.includes('Failed to fetch')) {
        setFieldError('general', 'Network error. Please check your internet connection and try again.');
      } else if (err.message?.includes('QuotaExceededError')) {
        setFieldError('general', 'Device storage quota exceeded. Please try with fewer photos.');
      } else {
      setFieldError('general', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background border border-border shadow rounded-lg">
          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Model Application</h1>
              <span className="text-sm text-muted-foreground">Step {currentStep} of 4</span>
            </div>
            <div className="mt-4">
              <div className="bg-muted rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Form Content */}
          <form onSubmit={handleSubmit} className="px-6 py-8">
            {currentStep === 1 && (
              <div className="space-y-4">
                <InputField
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  error={getFieldError('name')}
                  required
                />
                
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                  error={getFieldError('email')}
                  required
                />
                
                <InputField
                  label="Nickname (optional)"
                  name="nickname"
                  value={form.nickname}
                  onChange={(e) => updateForm({ nickname: e.target.value })}
                  placeholder="How you'd like to be called professionally"
                />
                
                <InputField
                  label="City"
                  name="location"
                  value={form.location}
                  onChange={(e) => updateForm({ location: e.target.value })}
                  placeholder="City"
                  error={getFieldError('location')}
                  required
                />
                
                <InputField
                  label="Instagram Handle"
                  name="instagramHandle"
                  value={form.instagramHandle}
                  onChange={(e) => updateForm({ instagramHandle: e.target.value })}
                  placeholder="@username"
                  error={getFieldError('instagramHandle')}
                  required
                />
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-4">
                <SelectField
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={(e) => updateForm({ gender: e.target.value })}
                  error={getFieldError('gender')}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="NON_BINARY">Non-binary</option>
                </SelectField>
                
                <InputField
                  label="Age"
                  name="age"
                  type="number"
                  value={form.age || ""}
                  onChange={(e) => updateForm({ age: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 25"
                  min={16}
                  max={80}
                  error={getFieldError('age')}
                  required
                />
                
                <InputField
                  label="Height (cm)"
                  name="heightCm"
                  type="number"
                  value={form.heightCm || ""}
                  onChange={(e) => updateForm({ heightCm: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 170"
                  min={100}
                  max={250}
                  error={getFieldError('heightCm')}
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <InputField
                     label="Chest/Bust (cm) (optional)"
                     name="bustCm"
                     type="number"
                     value={form.bustCm || ""}
                     onChange={(e) => updateForm({ bustCm: parseInt(e.target.value) || 0 })}
                     placeholder="e.g., 85"
                     min={50}
                     max={150}
                   />
                  
                                     <InputField
                     label="Waist (cm) (optional)"
                     name="waistCm"
                     type="number"
                     value={form.waistCm || ""}
                     onChange={(e) => updateForm({ waistCm: parseInt(e.target.value) || 0 })}
                     placeholder="e.g., 70"
                     min={50}
                     max={150}
                   />
                </div>
                
                <SelectField
                  label="Shirt Size"
                  name="shirtSize"
                  value={form.shirtSize}
                  onChange={(e) => updateForm({ shirtSize: e.target.value })}
                  error={getFieldError('shirtSize')}
                  required
                >
                  <option value="">Select Shirt Size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </SelectField>
                
                <SelectField
                  label="Pant Size (EU)"
                  name="pantSize"
                  value={form.pantSize}
                  onChange={(e) => updateForm({ pantSize: e.target.value })}
                  error={getFieldError('pantSize')}
                  required
                >
                  <option value="">Select Pant Size</option>
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
                </SelectField>
                
                <SelectField
                  label="Shoes Size"
                  name="shoesSize"
                  value={form.shoesSize}
                  onChange={(e) => updateForm({ shoesSize: e.target.value })}
                  error={getFieldError('shoesSize')}
                  required
                >
                  <option value="">Select Shoes Size</option>
                  <option value="35">35</option>
                  <option value="36">36</option>
                  <option value="37">37</option>
                  <option value="38">38</option>
                  <option value="39">39</option>
                  <option value="40">40</option>
                  <option value="41">41</option>
                  <option value="42">42</option>
                  <option value="43">43</option>
                  <option value="44">44</option>
                  <option value="45">45</option>
                  <option value="46">46</option>
                </SelectField>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Modeling Categories * (Select all that apply)
                  </label>
                  <div className="mt-2 space-y-2">
                    {["FASHION", "COMMERCIAL", "FITNESS", "BEAUTY", "RUNWAY", "EDITORIAL"].map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-border text-accent focus:ring-accent"
                          checked={form.categories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateForm({ categories: [...form.categories, category] });
                            } else {
                              updateForm({ categories: form.categories.filter(c => c !== category) });
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-foreground">{category}</span>
                      </label>
                    ))}
                  </div>
                  {getFieldError('categories') && (
                    <p className="text-sm text-red-600 mt-1">{getFieldError('categories')}</p>
                  )}
                </div>
                
                <SelectField
                  label="Modeling Experience"
                  name="modelingExperience"
                  value={form.modelingExperience}
                  onChange={(e) => updateForm({ modelingExperience: e.target.value })}
                  error={getFieldError('modelingExperience')}
                  required
                >
                  <option value="">Select Experience Level</option>
                  <option value="BEGINNER">Beginner (0-1 years)</option>
                  <option value="INTERMEDIATE">Intermediate (1-3 years)</option>
                  <option value="EXPERIENCED">Experienced (3-5 years)</option>
                  <option value="PROFESSIONAL">Professional (5+ years)</option>
                </SelectField>
                
                <div>
                                     <label className="block text-sm font-medium text-foreground">
                     Photos * (Upload exactly 5 photos)
                   </label>
                   <p className="text-xs text-muted-foreground mb-2">
                     Upload exactly 5 photos (doesn't have to be polaroids)
                   </p>
                                     <div className="mb-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg shadow-sm">
                     <div className="flex items-center gap-3">
                       <div className="flex-shrink-0">
                         <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                         </svg>
                       </div>
                       <div>
                         <p className="text-sm font-semibold text-red-800">NO SELFIES</p>
                         <p className="text-xs text-red-700 mt-0.5">Selfies automatically "cancels" your application.</p>
                       </div>
                     </div>
                   </div>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="mt-1 block w-full rounded-md border border-border bg-muted text-foreground shadow-sm focus:border-accent focus:ring-accent focus:bg-background"
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    required
                  />
                                     <p className="mt-1 text-xs text-muted-foreground">
                    Max 50 MB
                   </p>
                  {getFieldError('photos') && (
                    <p className="text-sm text-red-600 mt-1">{getFieldError('photos')}</p>
                  )}
                  {form.photos.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Selected photos: {form.photos.length}</p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {form.photos.map((file, index) => (
                          <div key={index} className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-20 object-cover rounded border border-border"
                            />
                            <button
                              type="button"
                              onClick={() => updateForm({ photos: form.photos.filter((_, i) => i !== index) })}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <TextAreaField
                  label="Bio About You (optional)"
                  name="bio"
                  value={form.bio}
                  onChange={(e) => updateForm({ bio: e.target.value })}
                  placeholder="Tell us about yourself, your experience, interests, etc."
                  rows={4}
                />
              </div>
            )}
            
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Terms & Agreement</h2>
                
                <div className="space-y-4">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-gray-300 text-accent focus:ring-accent"
                      checked={form.termsAccepted}
                      onChange={(e) => updateForm({ termsAccepted: e.target.checked })}
                      required
                    />
                    <span className="ml-3 text-sm text-foreground">
                      I agree to the <Link href="/terms" className="text-accent underline">Terms of Service</Link> and 
                      understand that my application will be reviewed before approval. *
                    </span>
                  </label>
                  {getFieldError('termsAccepted') && (
                    <p className="text-sm text-red-600 mt-1">{getFieldError('termsAccepted')}</p>
                  )}
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-foreground mb-2">What happens next?</h3>
                  <ul className="text-sm text-foreground space-y-1">
                    <li>• Your application will be reviewed by our team</li>
                    <li>• You&apos;ll receive an email within 2-3 business days</li>
                    <li>• Your profile will then be visible to brands on the platform</li>
                  </ul>
                </div>
              </div>
            )}
            
            {getFieldError('general') && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{getFieldError('general')}</p>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
              )}
                             {currentStep < 4 ? (
                 <button
                   type="button"
                   onClick={nextStep}
                   className="ml-auto rounded-md bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent/90 transition-colors"
                 >
                   Next
                 </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isFormComplete() || loading}
                  className="ml-auto rounded-md bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
