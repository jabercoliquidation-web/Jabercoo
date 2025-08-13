import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemFormSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Price must be positive"),
});

export type ItemFormData = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  onAddItem: (item: ItemFormData) => void;
}

export function ItemForm({ onAddItem }: ItemFormProps) {
  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      unitPrice: 0,
    },
  });

  const handleSubmit = (data: ItemFormData) => {
    onAddItem(data);
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-jaberco-blue" />
          Add Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter item description"
                        data-testid="input-item-name"
                        className="focus:ring-jaberco-blue focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        placeholder="1"
                        data-testid="input-item-quantity"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        className="focus:ring-jaberco-blue focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price (CAD)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        data-testid="input-item-price"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="focus:ring-jaberco-blue focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-jaberco-blue text-white hover:bg-jaberco-dark transition-colors duration-200"
              data-testid="button-add-item"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item to Invoice
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
