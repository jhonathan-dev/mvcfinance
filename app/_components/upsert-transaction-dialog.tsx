"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
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
import { DatePicker } from "./ui/date-picker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { upsertTransaction } from "../_actions/add-transaction";
import {
  UpsertOperacaoSchema,
  upsertOperacaoSchema,
} from "../_actions/add-transaction/schema";
import { OpcoesOperacao } from "../_data/get-opcoes-operacao";
import { useMemo } from "react";

interface UpsertTransactionDialogProps {
  isOpen: boolean;
  defaultValues?: UpsertOperacaoSchema;
  setIsOpen: (isOpen: boolean) => void;
  opcoes: OpcoesOperacao;
}

const UpsertTransactionDialog = ({
  isOpen,
  setIsOpen,
  defaultValues,
  opcoes,
}: UpsertTransactionDialogProps) => {
  // A categoria padrão precisa ser do tipo padrão: o select de categoria só
  // lista as categorias do tipo escolhido.
  const tipoPadraoId = opcoes.tipos[0]?.id ?? "";
  const categoriaPadraoId =
    opcoes.categorias.find((c) => c.tipoOperacaoId === tipoPadraoId)?.id ?? "";

  const form = useForm<UpsertOperacaoSchema>({
    resolver: zodResolver(upsertOperacaoSchema),
    defaultValues: defaultValues ?? {
      valor: 0,
      categoriaId: categoriaPadraoId,
      data: new Date(),
      titulo: "",
      metodoPagamentoId: opcoes.metodos[0]?.id ?? "",
      tipoOperacaoId: tipoPadraoId,
    },
  });

  const tipoSelecionado = form.watch("tipoOperacaoId");
  const categoriasDoTipo = useMemo(
    () => opcoes.categorias.filter((c) => c.tipoOperacaoId === tipoSelecionado),
    [opcoes.categorias, tipoSelecionado],
  );

  const onSubmit = async (data: UpsertOperacaoSchema) => {
    try {
      await upsertTransaction(data);
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const isUpdate = Boolean(defaultValues?.id);

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
          <DialogTitle>
            {isUpdate ? "Editar" : "Adicionar"} Operação
          </DialogTitle>
          <DialogDescription>
            Insira as informações da operação
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
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
              name="valor"
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
              name="tipoOperacaoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Já deixa selecionada a primeira categoria do novo tipo.
                      const primeira = opcoes.categorias.find(
                        (c) => c.tipoOperacaoId === value,
                      );
                      form.setValue("categoriaId", primeira?.id ?? "", {
                        shouldValidate: form.formState.isSubmitted,
                      });
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de operação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {opcoes.tipos.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.tipo}
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
              name="metodoPagamentoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {opcoes.metodos.map((metodo) => (
                        <SelectItem key={metodo.id} value={metodo.id}>
                          {metodo.nome}
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
              name="categoriaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriasDoTipo.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
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
              name="data"
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
              <Button type="submit">
                {isUpdate ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertTransactionDialog;
