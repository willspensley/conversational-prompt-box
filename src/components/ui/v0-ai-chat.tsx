
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    XIcon,
    CameraIcon,
} from "lucide-react";
import { selectImagesFromDevice, takePhotosFromCamera, fileToDataUrl } from "@/lib/image-upload";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface UploadedImage {
    id: string;
    dataUrl: string;
    file: File;
}

export function VercelV0Chat() {
    const [value, setValue] = useState("");
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const { toast } = useToast();
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() || uploadedImages.length > 0) {
                // Here you would handle the submission with both text and images
                console.log("Submitting:", { text: value, images: uploadedImages });
                setValue("");
                setUploadedImages([]);
                adjustHeight(true);
            }
        }
    };

    const handleAttachFiles = async () => {
        try {
            const files = await selectImagesFromDevice();
            if (files.length === 0) return;
            
            const newImages = await Promise.all(
                files.map(async (file) => {
                    const dataUrl = await fileToDataUrl(file);
                    return {
                        id: Math.random().toString(36).substring(2, 11),
                        dataUrl,
                        file,
                    };
                })
            );
            
            setUploadedImages((prev) => [...prev, ...newImages]);
            toast({
                title: "Images attached",
                description: `${files.length} image${files.length > 1 ? 's' : ''} attached successfully.`,
            });
        } catch (error) {
            console.error("Error attaching files:", error);
            toast({
                title: "Error attaching images",
                description: "Failed to attach images. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleTakePhotos = async () => {
        try {
            const photos = await takePhotosFromCamera();
            if (photos.length === 0) return;
            
            const newImages = await Promise.all(
                photos.map(async (file) => {
                    const dataUrl = await fileToDataUrl(file);
                    return {
                        id: Math.random().toString(36).substring(2, 11),
                        dataUrl,
                        file,
                    };
                })
            );
            
            setUploadedImages((prev) => [...prev, ...newImages]);
            toast({
                title: "Photos added",
                description: `${photos.length} photo${photos.length > 1 ? 's' : ''} added successfully.`,
            });
        } catch (error) {
            console.error("Error taking photos:", error);
            toast({
                title: "Camera error",
                description: "Failed to access camera. Please check your permissions.",
                variant: "destructive",
            });
        }
    };

    const removeImage = (id: string) => {
        setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    };

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
            {/* Removed the "What can I help you ship?" heading */}
            
            <div className="w-full">
                <div className="relative bg-neutral-900 dark:bg-neutral-900 rounded-xl border border-neutral-800">
                    {uploadedImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 border-b border-neutral-800">
                            {uploadedImages.map((img) => (
                                <div 
                                    key={img.id} 
                                    className="relative group w-16 h-16 rounded-md overflow-hidden"
                                >
                                    <img 
                                        src={img.dataUrl} 
                                        alt="Uploaded" 
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(img.id)}
                                        className="absolute top-1 right-1 bg-black bg-opacity-60 p-1 rounded-full hidden group-hover:block"
                                    >
                                        <XIcon className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Give context of what report you need"
                            className={cn(
                                "w-full px-4 py-3",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-white text-sm",
                                "focus:outline-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-neutral-500 placeholder:text-sm",
                                "min-h-[60px]"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleAttachFiles}
                                className="group p-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Paperclip className="w-4 h-4 text-white" />
                                <span className="text-xs text-zinc-400 hidden group-hover:inline transition-opacity">
                                    Attach
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleTakePhotos}
                                className="px-2 py-1 rounded-lg text-sm text-zinc-400 transition-colors border border-dashed border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1"
                            >
                                <CameraIcon className="w-4 h-4" />
                                Project
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    "px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1",
                                    (value.trim() || uploadedImages.length > 0)
                                        ? "bg-white text-black"
                                        : "text-zinc-400"
                                )}
                            >
                                <ArrowUpIcon
                                    className={cn(
                                        "w-4 h-4",
                                        (value.trim() || uploadedImages.length > 0)
                                            ? "text-black"
                                            : "text-zinc-400"
                                    )}
                                />
                                <span className="sr-only">Send</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                    <ActionButton
                        icon={<ImageIcon className="w-4 h-4" />}
                        label="Clone a Screenshot"
                    />
                    <ActionButton
                        icon={<Figma className="w-4 h-4" />}
                        label="Import from Figma"
                    />
                    <ActionButton
                        icon={<FileUp className="w-4 h-4" />}
                        label="Upload a Project"
                    />
                    <ActionButton
                        icon={<MonitorIcon className="w-4 h-4" />}
                        label="Landing Page"
                    />
                    <ActionButton
                        icon={<CircleUserRound className="w-4 h-4" />}
                        label="Sign Up Form"
                    />
                </div>
            </div>
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    return (
        <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
}
