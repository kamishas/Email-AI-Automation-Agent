import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '../config/api';
import { Button } from './ui/button';

interface UploadedImage {
    url: string;
    filename: string;
}

interface ImageUploaderProps {
    onImageUploaded?: (imageUrl: string) => void;
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const base64 = await fileToBase64(file);
            const base64Data = base64.split(',')[1];

            // Send to AWS Lambda for compliance check
            const response = await apiClient.post(API_ENDPOINTS.IMAGES.CHECK_AND_UPLOAD, {
                image: base64Data,
                campaignId: 'default',  // TODO: Get from context
                filename: file.name
            });

            if (!response.isCompliant) {
                // Image has violations - show error
                setError(`Image blocked: ${response.violations.length} EEOC violation(s) detected`);
                console.error('Image compliance violations:', response.violations);
                setUploading(false);
                return;
            }

            // Image is compliant - add to list
            const newImage = {
                url: response.url,
                filename: file.name
            };

            setUploadedImages([...uploadedImages, newImage]);
            onImageUploaded?.(response.url);
            setError(null);
        } catch (err) {
            setError('Failed to upload image');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        const updated = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(updated);
    };

    const copyImageUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        alert('Image URL copied to clipboard!');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        className="flex items-center gap-2"
                        asChild
                    >
                        <span>
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Checking compliance...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Upload Image
                                </>
                            )}
                        </span>
                    </Button>
                </label>
                <span className="text-sm text-gray-500">Max 5MB • JPG, PNG, GIF</span>
            </div>

            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <div className="text-sm font-medium text-red-800">Upload Failed</div>
                        <div className="text-sm text-red-700 mt-1">{error}</div>
                    </div>
                </div>
            )}

            {uploadedImages.length > 0 && (
                <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700">Uploaded Images:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {uploadedImages.map((img, idx) => (
                            <div key={idx} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <img
                                    src={img.url}
                                    alt={img.filename}
                                    className="w-full h-32 object-cover"
                                />
                                <div className="p-2 space-y-2">
                                    <div className="text-xs text-gray-600 truncate" title={img.filename}>
                                        {img.filename}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => copyImageUrl(img.url)}
                                            className="flex-1 text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                                        >
                                            Copy URL
                                        </button>
                                        <button
                                            onClick={() => handleRemoveImage(idx)}
                                            className="px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
                        💡 <strong>Tip:</strong> Copy the image URL and paste it in your email body using HTML:
                        <code className="block mt-1 bg-white px-2 py-1 rounded border text-xs">
                            &lt;img src="IMAGE_URL" alt="Description" /&gt;
                        </code>
                    </div>
                </div>
            )}
        </div>
    );
}
