import { Edital } from "./Edital";
import UserData, { IUserData } from "./UserData";

// Interface para dados específicos do Proposer
export interface IProposer extends IUserData {
  cnpj: string;
  listEdital: Edital[];
}

// Classe Proposer que herda de UserData
export class Proposer extends UserData implements IProposer {
  cnpj!: string;
  listEdital!: Edital[];

  constructor(
    password?: string,
    name?: string,
    email?: string,
    imgUrl?: string,
    cnpj?: string
  ) {
    super(password, name, email, imgUrl);
    
    if (cnpj) this.cnpj = cnpj;
    
    // Inicializar valores padrão específicos do Proposer
    this.listEdital = [];
    this.userType = "PROPOSER";
  }

  /**
   * Sobrescreve para retornar o tipo fixo
   */
  getUserType(): string {
    return "PROPOSER";
  }

  // Método para validar CNPJ (implementação básica)
  isValidCnpj(): boolean {
    if (!this.cnpj) return false;
    
    // Remove caracteres não numéricos
    const cleanCnpj = this.cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cleanCnpj.length !== 14) return false;
    
    // Verifica se não são todos dígitos iguais
    if (/^(\d)\1+$/.test(cleanCnpj)) return false;
    
    return true;
  }

  // Método para formatar CNPJ
  getFormattedCnpj(): string {
    if (!this.cnpj) return '';
    
    const cleanCnpj = this.cnpj.replace(/[^\d]/g, '');
    
    if (cleanCnpj.length === 14) {
      return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return this.cnpj;
  }

  // Método para adicionar edital à lista
  addEdital(edital: Edital): void {
    if (!this.listEdital.includes(edital)) {
      this.listEdital.push(edital);
      this.updateTimestamp();
    }
  }

  // Método para remover edital da lista
  removeEdital(editalId: number): void {
    const index = this.listEdital.findIndex(edital => edital.id === editalId);
    if (index > -1) {
      this.listEdital.splice(index, 1);
      this.updateTimestamp();
    }
  }

  // Sobrescreve o método toJSON para incluir dados específicos do Proposer
  toJSON(): IProposer {
    return {
      ...super.toJSON(),
      cnpj: this.cnpj,
      listEdital: this.listEdital
    };
  }

  // Método estático específico para Proposer
  static createFromData(data: Partial<IProposer>): Proposer {
    const instance = new Proposer(
      data.password,
      data.name,
      data.email,
      data.imgUrl,
      data.cnpj
    );
    
    // Aplicar outros campos
    if (data.id) instance.id = data.id;
    if (data.createdAt) instance.createdAt = data.createdAt;
    if (data.updatedAt) instance.updatedAt = data.updatedAt;
    if (data.userType) instance.userType = data.userType;
    if (data.listComment) instance.listComment = data.listComment;
    if (data.listEdital) instance.listEdital = data.listEdital;
    
    return instance;
  }
}

// Tipo para dados de entrada na criação de Proposer
export interface CreateProposerData {
  password: string;
  name: string;
  email: string;
  cnpj: string;
  imgUrl?: string;
}

// Tipo para dados de entrada na atualização de Proposer
export interface UpdateProposerData {
  password?: string;
  name?: string;
  email?: string;
  cnpj?: string;
  imgUrl?: string;
}

// Tipo para resposta da API (sem senha)
export interface ProposerResponse extends Omit<IProposer, 'password'> {}

export default Proposer;