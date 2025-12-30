import { useState } from "react";
import { FormField } from "./formfield";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

type SimpleModalProps = {
    open: boolean;
    primaryTitle: string;
    secondaryTitle: string;
    tertiaryTitle: string;
    onClose: () => void;
    onSubmit: (data: { name: string; imageUrl: string }) => void;
};

export function SimpleModal({
    open,
    primaryTitle,
    secondaryTitle,
    tertiaryTitle,
    onClose,
    onSubmit,
}: SimpleModalProps) {
    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [error, setError] = useState<string | null>(null)

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-96 rounded-xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative flex items-center py-2">
                    <Button onClick={onClose} variant="backcreatestall" size="bare">
                        <ArrowLeft className="text-primary1" />
                    </Button>
                    <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-primary1">
                        {primaryTitle}
                    </h2>
                </div>
                <div className="mt-4 space-y-3 mx-7">
                <FormField
                    className="flex flex-col space-y-2 font-semibold"
                    classNameOut={`
                                p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80"}
                                `}
                    classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
                    variant="text"
                    label={secondaryTitle}
                    inputProps={{ value: name, placeholder: "Name", onChange: (e) => { setName(e.target.value); setError(null); } }} />

                <FormField
                    className="flex flex-col space-y-2 font-semibold"
                    classNameOut={`
                                p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary1/80"}
                                `}
                    classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
                    variant="text"
                    label={tertiaryTitle}
                    inputProps={{ value: imageUrl, placeholder: "Upload Image", onChange: (e) => { setImageUrl(e.target.value); setError(null); } }} />
                <div className="mt-10 w-full flex justify-center">
                    <Button
                        className="py-2 rounded-2xl font-bold bg-gray-400 hover:bg-primary2"
                        onClick={() => onSubmit({ name, imageUrl })}
                        disabled={!name.trim()}
                    >
                        Create
                    </Button>
                </div>
                </div>

            </div>
        </div>
    );
}
