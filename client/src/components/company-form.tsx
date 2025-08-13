import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const companyFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(13),
});

export type CompanyFormData = z.infer<typeof companyFormSchema>;

interface CompanyFormProps {
  onCompanyChange: (company: CompanyFormData) => void;
  initialData?: CompanyFormData;
}

export function CompanyForm({ onCompanyChange, initialData }: CompanyFormProps) {
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      website: initialData?.website || "",
      taxRate: initialData?.taxRate || 13,
    },
  });

  const handleFormChange = () => {
    const formData = form.getValues();
    onCompanyChange(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-jaberco-blue" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter company name"
                      data-testid="input-company-name"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFormChange();
                      }}
                      className="focus:ring-jaberco-blue focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter phone number"
                      data-testid="input-company-phone"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFormChange();
                      }}
                      className="focus:ring-jaberco-blue focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter company address"
                        data-testid="input-company-address"
                        onChange={(e) => {
                          field.onChange(e);
                          handleFormChange();
                        }}
                        className="focus:ring-jaberco-blue focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="www.example.com"
                      data-testid="input-company-website"
                      onChange={(e) => {
                        field.onChange(e);
                        handleFormChange();
                      }}
                      className="focus:ring-jaberco-blue focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      data-testid="input-tax-rate"
                      onChange={(e) => {
                        field.onChange(parseFloat(e.target.value) || 0);
                        handleFormChange();
                      }}
                      className="focus:ring-jaberco-blue focus:border-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
