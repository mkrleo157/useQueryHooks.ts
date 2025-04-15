import React, { Fragment } from "react";
import { Control, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import FormFieldsRender from "@/components/formBuilder/FormFieldsRender";
import { Section } from "@/types/FormFiledsRenderTypes";

interface FormSectionProps<T extends FieldValues> {
  control: Control<T, any>;
  fieldsData: Section;
}

const FormSection: React.FC<FormSectionProps<any>> = ({
  control,
  fieldsData,
}) => {
  const colSpan = [
    "legalName",
    "companyAddress",
    "lineAddress1",
    "lineAddress2",
  ];
  return (
    <Fragment>
      {fieldsData.sectionName && (
        <h1 className="text-2xl font-semibold border-b-[1px] border-customGray pb-2 pt-5">
          {fieldsData.sectionName}
        </h1>
      )}
      {/* Render fields dynamically based on fieldsData */}
      <div className="w-full py-4">
        <div
          key={fieldsData.sectionKey}
          className={cn(
            "grid grid-cols-1  gap-4 ",
            [
              "ACTION",
              "SIDEDRAWER_SUPPLIER_DETAILS",
              "CREATE_USER_AGENT",
            ].includes(fieldsData.sectionKey)
              ? "md:grid-cols-1"
              : "md:grid-cols-2",
          )}
        >
          {fieldsData.fields.map((field) => (
            <div
              key={field.fieldKey}
              className={cn(
                colSpan.includes(field.fieldKey) ? "col-span-2" : "col-span-1",
              )}
            >
              <FormFieldsRender field={field} control={control as Control} />
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default FormSection;
