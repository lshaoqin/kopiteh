import { EmailInput, PasswordInput, TextInput, NumberInput } from "@/components/ui/input"

function FormField({ className, variant, label, inputProps }) {
    return (
        <div className={className}>
            <text>{label}</text>
            {variant == "email" ? (<EmailInput className="p-2 bg-white rounded-sm border-1" {...inputProps}/>) : 
             variant == "password" ? (<PasswordInput className="p-2 bg-white rounded-sm border-1" {...inputProps}/>) : 
             variant == "text" ? (<TextInput className="p-2 bg-white rounded-sm border-1" {...inputProps}/>) : 
             variant == "number" ? (<NumberInput className="p-2 bg-white rounded-sm border-1" {...inputProps}/>) : 
             <TextInput className="p-2 bg-white rounded-sm border-1"/>}
        </div>
    )
}

export { FormField }