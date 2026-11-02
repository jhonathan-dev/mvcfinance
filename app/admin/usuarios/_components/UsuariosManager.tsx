"use client";

import { useState } from "react";
import {
  Ban,
  Crown,
  Mail,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Card } from "@/app/_components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Switch } from "@/app/_components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import ConfirmAcao from "../../_components/ConfirmAcao";
import ConfirmDelete from "../../_components/ConfirmDelete";
import {
  convidarUsuario,
  definirBanimento,
  definirPapelAdmin,
  definirPlanoPremium,
  excluirUsuario,
  revogarConvite,
} from "../../_actions/usuarios";
import { ConviteLinha, UsuarioLinha } from "./tipos";

interface UsuariosManagerProps {
  usuarios: UsuarioLinha[];
  convites: ConviteLinha[];
}

const UsuariosManager = ({ usuarios, convites }: UsuariosManagerProps) => {
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [conviteAberto, setConviteAberto] = useState(false);
  const [email, setEmail] = useState("");
  const [conviteAdmin, setConviteAdmin] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Executa uma ação do servidor, mostra o resultado e trava os botões da
  // linha enquanto ela roda (evita clique duplo).
  const executar = async (
    chave: string,
    acao: () => Promise<{ ok: true } | { ok: false; erro: string }>,
    sucesso: string,
  ) => {
    if (ocupado) return;
    setOcupado(chave);
    try {
      const resultado = await acao();
      if (!resultado.ok) return toast.error(resultado.erro);
      toast.success(sucesso);
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setOcupado(null);
    }
  };

  const enviarConvite = async () => {
    if (!email.trim()) return toast.error("Informe o e-mail.");
    setEnviando(true);
    try {
      const resultado = await convidarUsuario({
        email,
        admin: conviteAdmin,
      });
      if (!resultado.ok) return toast.error(resultado.erro);
      toast.success(`Convite enviado para ${email.trim().toLowerCase()}`);
      setConviteAberto(false);
      setEmail("");
      setConviteAdmin(false);
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => setConviteAberto(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Convidar usuário
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Atividade</TableHead>
              <TableHead>Datas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
            {usuarios.map((u) => {
              const travado = ocupado !== null;
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.imagem}
                        alt=""
                        className="h-9 w-9 rounded-full bg-muted object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {u.nome}
                          {u.ehVoce && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              (você)
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.admin && <Badge>Admin</Badge>}
                      {u.premium && (
                        <Badge className="border-transparent bg-amber-500 text-white hover:bg-amber-500">
                          Premium
                        </Badge>
                      )}
                      {!u.admin && !u.premium && (
                        <Badge variant="outline">Gratuito</Badge>
                      )}
                      {u.banido && <Badge variant="destructive">Banido</Badge>}
                      {u.bloqueado && (
                        <Badge variant="secondary">Bloqueado</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <p>
                      XP: <b className="text-foreground">{u.xp ?? "-"}</b>
                    </p>
                    <p>
                      Cursos concluídos:{" "}
                      <b className="text-foreground">{u.cursosConcluidos}</b>
                    </p>
                    <p>
                      Operações:{" "}
                      <b className="text-foreground">{u.operacoes}</b>
                    </p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <p>Cadastro: {u.cadastro}</p>
                    <p>Último acesso: {u.ultimoAcesso ?? "nunca"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ConfirmAcao
                        titulo={
                          u.admin
                            ? "Remover acesso de administrador?"
                            : "Tornar administrador?"
                        }
                        descricao={
                          u.admin
                            ? `${u.nome} deixará de acessar o painel admin.`
                            : `${u.nome} poderá acessar o painel admin e alterar cursos, cadastros e usuários.`
                        }
                        confirmar={u.admin ? "Remover acesso" : "Tornar admin"}
                        perigosa={u.admin}
                        onConfirm={() =>
                          executar(
                            `papel-${u.id}`,
                            () =>
                              definirPapelAdmin({
                                userId: u.id,
                                admin: !u.admin,
                              }),
                            u.admin
                              ? "Acesso de administrador removido"
                              : "Usuário agora é administrador",
                          )
                        }
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={u.ehVoce || travado}
                          title={
                            u.ehVoce
                              ? "Você não pode alterar a própria conta"
                              : u.admin
                                ? "Remover acesso de administrador"
                                : "Tornar administrador"
                          }
                        >
                          {u.admin ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                        </Button>
                      </ConfirmAcao>

                      <ConfirmAcao
                        titulo={
                          u.premium
                            ? "Remover o plano premium?"
                            : "Conceder o plano premium?"
                        }
                        descricao={
                          u.premium
                            ? "A pessoa perde o acesso premium imediatamente. Se ela tiver uma assinatura ativa no Stripe, a assinatura continua cobrando: cancele-a lá também."
                            : "A pessoa terá acesso premium sem passar pelo pagamento. O cancelamento de uma assinatura no Stripe pode remover este acesso depois."
                        }
                        confirmar={u.premium ? "Remover premium" : "Conceder"}
                        perigosa={u.premium}
                        onConfirm={() =>
                          executar(
                            `plano-${u.id}`,
                            () =>
                              definirPlanoPremium({
                                userId: u.id,
                                premium: !u.premium,
                              }),
                            u.premium
                              ? "Plano premium removido"
                              : "Plano premium concedido",
                          )
                        }
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={travado}
                          title={
                            u.premium
                              ? "Remover plano premium"
                              : "Conceder plano premium"
                          }
                        >
                          <Crown
                            className={`h-4 w-4 ${u.premium ? "text-amber-500" : ""}`}
                          />
                        </Button>
                      </ConfirmAcao>

                      <ConfirmAcao
                        titulo={
                          u.banido ? "Desbanir usuário?" : "Banir usuário?"
                        }
                        descricao={
                          u.banido
                            ? `${u.nome} poderá entrar no sistema novamente.`
                            : `${u.nome} não conseguirá mais entrar no sistema. Os dados dele são mantidos.`
                        }
                        confirmar={u.banido ? "Desbanir" : "Banir"}
                        perigosa={!u.banido}
                        onConfirm={() =>
                          executar(
                            `ban-${u.id}`,
                            () =>
                              definirBanimento({
                                userId: u.id,
                                banido: !u.banido,
                              }),
                            u.banido ? "Usuário desbanido" : "Usuário banido",
                          )
                        }
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={u.ehVoce || travado}
                          title={
                            u.ehVoce
                              ? "Você não pode alterar a própria conta"
                              : u.banido
                                ? "Desbanir"
                                : "Banir"
                          }
                        >
                          {u.banido ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <Ban className="h-4 w-4" />
                          )}
                        </Button>
                      </ConfirmAcao>

                      <ConfirmDelete
                        description={`Isto exclui a conta de ${u.nome} e apaga todo o progresso, XP, conquistas e operações dessa pessoa. Esta ação não pode ser desfeita.`}
                        onConfirm={() =>
                          executar(
                            `del-${u.id}`,
                            () => excluirUsuario({ userId: u.id }),
                            "Usuário excluído",
                          )
                        }
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={u.ehVoce || travado}
                          title={
                            u.ehVoce
                              ? "Você não pode excluir a própria conta"
                              : "Excluir usuário"
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </ConfirmDelete>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {convites.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Convites pendentes</h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Enviado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {convites.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {c.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      {c.admin ? (
                        <Badge>Admin</Badge>
                      ) : (
                        <Badge variant="outline">Usuário</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.enviadoEm}
                    </TableCell>
                    <TableCell className="text-right">
                      <ConfirmAcao
                        titulo="Revogar convite?"
                        descricao={`O link enviado para ${c.email} deixará de funcionar.`}
                        confirmar="Revogar"
                        perigosa
                        onConfirm={() =>
                          executar(
                            `inv-${c.id}`,
                            () => revogarConvite({ conviteId: c.id }),
                            "Convite revogado",
                          )
                        }
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={ocupado !== null}
                        >
                          Revogar
                        </Button>
                      </ConfirmAcao>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      <Dialog open={conviteAberto} onOpenChange={setConviteAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar usuário</DialogTitle>
            <DialogDescription>
              A pessoa recebe um e-mail com um link para criar a própria conta e
              a própria senha.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="convite-email">E-mail</Label>
              <Input
                id="convite-email"
                type="email"
                placeholder="pessoa@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="convite-admin">
                  Convidar como administrador
                </Label>
                <p className="text-xs text-muted-foreground">
                  Dá acesso ao painel admin assim que a conta for criada.
                </p>
              </div>
              <Switch
                id="convite-admin"
                checked={conviteAdmin}
                onCheckedChange={setConviteAdmin}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConviteAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={enviarConvite} disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar convite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsuariosManager;
