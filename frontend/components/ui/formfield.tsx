import { EmailInput, PasswordInput, TextInput, NumberInput } from "@/components/ui/input"

function FormField({ className, classNameOut, classNameIn, variant, label, inputProps }) {
    return (
        <div className={className}>
           {label ? <label>{label}</label> : <label></label>}
            {variant == "email" ? (<EmailInput classNameOut={classNameOut} classNameIn={classNameIn} {...inputProps}/>) : 
             variant == "password" ? (<PasswordInput classNameOut={classNameOut} classNameIn={classNameIn} {...inputProps}/>) : 
             variant == "text" ? (<TextInput classNameOut={classNameOut} classNameIn={classNameIn} {...inputProps}/>) : 
             variant == "number" ? (<NumberInput classNameOut={classNameOut} classNameIn={classNameIn} {...inputProps}/>) : 
             <TextInput classNameOut={classNameOut} classNameIn={classNameIn}/>}
        </div>
    )
}

export { FormField }