import React, { Fragment } from "react";
import { Control, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import FormFieldsRender from "@/components/formBuilder/FormFieldsRender";
import { Section } from "@/types/FormFiledsRenderTypes";

interface FormSectionProps<T extends FieldValues> {
  control: Control<T, any>;
  fieldsData: Section;
  activeTab: number;
}

const FormSection: React.FC<FormSectionProps<any>> = ({
  control,
  fieldsData,
  activeTab,
}) => {
  const productFields = ["productName", "stockKeepingUnit"];
  const rowFields = ["productType", "productTags"];
  const colSpan = ["optionName", "optionDescription", "optionStatus"];

  return (
    <Fragment>
      {fieldsData.sectionName && (
        <h1 className="text-2xl font-semibold border-b-[1px] border-customGray pb-2 pt-5">
          {fieldsData.sectionName}
        </h1>
      )}
      <div className="w-full py-4">
        <div
          key={fieldsData.sectionKey}
          className={cn(
            "grid gap-4",
            activeTab === 4 ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2",
          )}
        >
          {fieldsData.fields.map((field, index) => {
            const isProductField = productFields.includes(field.fieldKey);
            const isRowField = rowFields.includes(field.fieldKey);

            if (isRowField && activeTab === 4) {
              if (index === 0 || index === 1) {
                return (
                  <div key={field.fieldKey} className="col-span-1">
                    <FormFieldsRender
                      field={field}
                      control={control as Control}
                    />
                  </div>
                );
              }
            }

            return (
              <div
                key={field.fieldKey}
                className={cn(
                  isProductField && activeTab === 4
                    ? "col-span-1"
                    : colSpan.includes(field.fieldKey)
                      ? "col-span-2"
                      : "col-span-1",
                )}
              >
                <FormFieldsRender field={field} control={control as Control} />
              </div>
            );
          })}
        </div>
      </div>
    </Fragment>
  );
};

export default FormSection;
