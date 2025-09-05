import Comment from "./CommentData";

// Interface base para dados do usuário
export interface IUserData {
  id: number;
  password: string;
  name: string;
  email: string;
  imgUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  userType?: string;
  listComment: Comment[];
}

// Classe abstrata UserData para Next.js
export abstract class UserData implements IUserData {
  id!: number;
  password!: string;
  name!: string;
  email!: string;
  imgUrl?: string;
  createdAt!: Date;
  updatedAt!: Date;
  userType?: string;
  listComment!: Comment[];

  // Construtor opcional
  constructor(
    password?: string,
    name?: string,
    email?: string,
    imgUrl?: string
  ) {
    if (password) this.password = password;
    if (name) this.name = name;
    if (email) this.email = email;
    if (imgUrl) this.imgUrl = imgUrl;
    
    // Inicializar valores padrão
    this.listComment = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Método abstrato para ser implementado nas subclasses
  abstract getUserType(): string;

  // Método para atualizar updatedAt
  updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  // Método para converter para objeto plano (útil para APIs)
  toJSON(): IUserData {
    return {
      id: this.id,
      password: this.password,
      name: this.name,
      email: this.email,
      imgUrl: this.imgUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      userType: this.userType,
      listComment: this.listComment
    };
  }

  // Método estático para criar instância a partir de dados
  static fromData<T extends UserData>(
    this: new (...args: any[]) => T,
    data: Partial<IUserData>
  ): T {
    const instance = new this();
    Object.assign(instance, data);
    return instance;
  }
}

// Tipo para dados de entrada na criação de usuário
export interface CreateUserData {
  password: string;
  name: string;
  email: string;
  imgUrl?: string;
}

// Tipo para dados de entrada na atualização de usuário
export interface UpdateUserData {
  password?: string;
  name?: string;
  email?: string;
  imgUrl?: string;
}

// Tipo para resposta da API (sem senha)
export interface UserDataResponse extends Omit<IUserData, 'password'> {}

export default UserData;