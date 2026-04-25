import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
/* import { Dialog, DialogTrigger } from "@radix-ui/react-dialog"; */
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { MoneyInput } from "./money-input";
import {
  TRANSACTION_CATEGORY_OPTIONS,
  TRANSACTION_PAYMENT_METHOD_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
} from "../_constants/operations";
import { DatePicker } from "./ui/date-picker";
import z from "zod";
import {
  OperationCategory,
  OperationPaymentMethod,
  OperationType,
} from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addOperation } from "../_actions/add-operation/index";

interface UpsertOperationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  defaultValues?: FormSchema;
}

const formSchema = z.object({
  name: z.string().trim().min(1, {
    message: "O nome é obrigatório.",
  }),
  amount: z.number().positive({
    message: "O valor é obrigatório.",
  }),
  type: z.nativeEnum(OperationType, {
    message: "O tipo é obrigatório.",
  }),
  category: z.nativeEnum(OperationCategory, {
    message: "A categoria é obrigatória.",
  }),
  paymentMethod: z.nativeEnum(OperationPaymentMethod, {
    message: "O método de pagamento é obrigatório.",
  }),
  // Para Date, use 'message' ou verifique se não há conflito com o objeto
  date: z.date({
    message: "A data é obrigatória.",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

const UpsertOperationDialog = ({
  isOpen,
  setIsOpen,
  defaultValues,
}: UpsertOperationDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? {
      amount: 0,
      category: OperationCategory.OTHER,
      date: new Date(),
      name: "",
      paymentMethod: OperationPaymentMethod.CASH,
      type: OperationType.EXPENSE,
    },
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      console.log("Submitting operation:", data);
      await addOperation(data);
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
          <DialogDescription>
            Insira as informações da transação
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <MoneyInput
                      placeholder="Digite o valor..."
                      value={field.value}
                      onValueChange={({ floatValue }) =>
                        field.onChange(floatValue)
                      }
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de transação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_PAYMENT_METHOD_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <DatePicker value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Adicionar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertOperationDialog;
