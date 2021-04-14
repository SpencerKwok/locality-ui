import { PostRpcClient } from "../../../common/rpc/RpcClient";
import {
  CompanyRequest,
  CompanyResponse,
  CompaniesRequest,
  CompaniesResponse,
  DepartmentsUpdateRequest,
  DepartmentsUpdateResponse,
  HomepageUpdateRequest,
  HomepageUpdateResponse,
  LogoUpdateRequest,
  LogoUpdateResponse,
} from "../../../common/rpc/Schema";

let instance: CompanyDAO;
export default class CompanyDAO {
  static getInstance() {
    if (instance) {
      return instance;
    }

    instance = new CompanyDAO(new PostRpcClient());
    return instance;
  }

  constructor(private rpc: PostRpcClient) {}

  async company(companyRequest: CompanyRequest): Promise<CompanyResponse> {
    return await this.rpc.call("Company", companyRequest, "/api/company");
  }

  async companies(
    companiesRequest: CompaniesRequest
  ): Promise<CompaniesResponse> {
    return await this.rpc.call("Companies", companiesRequest, "/api/companies");
  }

  async logoUpdate(
    logoUpdateRequest: LogoUpdateRequest
  ): Promise<LogoUpdateResponse> {
    return await this.rpc.call(
      "LogoUpdate",
      logoUpdateRequest,
      "/api/dashboard/logo/update"
    );
  }

  async homepageUpdate(
    homepageUpdateRequest: HomepageUpdateRequest
  ): Promise<HomepageUpdateResponse> {
    return await this.rpc.call(
      "HomepageUpdate",
      homepageUpdateRequest,
      "/api/dashboard/homepage/update"
    );
  }

  async departmentsUpdate(
    departmentsUpdateRequest: DepartmentsUpdateRequest
  ): Promise<DepartmentsUpdateResponse> {
    return await this.rpc.call(
      "DepartmentsUpdate",
      departmentsUpdateRequest,
      "/api/dashboard/departments/update"
    );
  }
}
