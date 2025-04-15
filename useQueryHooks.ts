import { useMutation, useQuery } from "@tanstack/react-query";
import {
  customCreateContact,
  customCreateLead,
  customGetLead,
  customGetProduct,
  customListLeads,
  customUpdateAccount,
  customUpdateAddress,
  customUpdateContact,
  customUpdateLead,
  getUserRoleQuery,
} from "@/app/hooks/customQuries/queries";
import {
  ConvertLeadMutationVariables,
  CustomCreateAccountMutationVariables,
  DeleteDocumentInput,
  GetAddressQuery,
  GetContactQuery,
  GetLeadQuery,
  LeadNotificationTriggerQueryVariables,
  ListDocumentsQueryVariables,
  ListLeadsQueryVariables,
  ListUsersQueryVariables,
  UpdateAccountMutationVariables,
  UpdateAddressInput,
  UpdateContactInput,
  UpdateDocumentInput,
  UpdateLeadMutationVariables,
  UploadDocumentPresignedUrlMutationVariables,
} from "@/app/graphql/API";
import {
  getAddress,
  leadNotificationTrigger,
  listDocuments,
  listUsers,
} from "@/app/graphql/queries";
import {
  convertLead,
  customCreateAccount,
  customCreateUser,
  updateDocument,
  uploadDocumentPresignedUrl,
  deleteDocument,
} from "@/app/graphql/mutations";
import { client, client_with_token } from "@/utils/amplifyGenerateClient";

export const useCreateLead = () =>
  useMutation({
    mutationFn: async (inputVariable: any) => {
      try {
        const { data } = await client.graphql({
          query: customCreateLead,
          variables: {
            input: inputVariable,
          },
          authMode: "identityPool",
        });
        return data.createLead;
      } catch (e) {
        console.log("Error : ", e);
        throw e;
      }
    },
  });

export const useUpdateLead = () =>
  useMutation({
    mutationFn: async (inputVariable: UpdateLeadMutationVariables) => {
      return client.graphql({
        query: customUpdateLead,
        variables: {
          input: inputVariable.input,
        },
      });
    },
  });
export const useUpdateAccount = () =>
  useMutation({
    mutationFn: async (inputVariable: any) => {
      try {
        const { data } = await client.graphql({
          query: customUpdateAccount,
          variables: {
            input: inputVariable,
          },
          authMode: "userPool",
        });
        return data;
      } catch (e) {
        console.log("Error : ", e);
        throw new Error(JSON.stringify(e));
      }
    },
  });

export const useGetUserRole = (userID: string) =>
  useQuery({
    queryKey: ["getUserRole", userID],
    queryFn: async () => {
      return await client.graphql({
        query: getUserRoleQuery,
        variables: {
          userID,
        },
      });
    },
    enabled: !!userID,
  });

export const useUserRole = () =>
  useMutation({
    mutationFn: async (variables: { userID: string; tenantId: string }) => {
      return client.graphql({
        query: getUserRoleQuery,
        variables: {
          userId: variables.userID,
          tenantId: variables.tenantId,
        },
        authMode: "userPool",
      });
    },
  });

export const useLeadList = (queryVariable: ListLeadsQueryVariables) =>
  useQuery({
    queryKey: ["leadList", queryVariable?.filter],
    queryFn: async () => {
      return await client.graphql({
        query: customListLeads,
        variables: queryVariable,
      });
    },
  });
export const useGetLeadDetails = (leadId: string) =>
  useQuery({
    refetchOnMount: false,
    queryKey: ["leadDetails", leadId],
    queryFn: async () => {
      type LeadContact = GetContactQuery["getContact"];
      type LeadData = GetLeadQuery["getLead"] & {
        leadContacts: {
          data: LeadContact[];
        };
        address: GetAddressQuery["getAddress"];
      };
      const { data, errors } = await client.graphql({
        query: customGetLead,
        variables: {
          leadId,
        },
      });
      const { data: address, errors: addressErrors } = await client.graphql({
        query: getAddress,
        variables: {
          addressId: leadId,
        },
      });
      if (errors || addressErrors) {
        throw errors || addressErrors;
      }
      return {
        ...data.getLead,
        leadContacts: {
          data:
            data?.getLead?.leadContacts &&
            data?.getLead?.leadContacts?.items?.length > 0
              ? data?.getLead?.leadContacts?.items
              : [],
        },
        address,
      } as unknown as LeadData;
    },
  });
export const useUserList = (queryVariable: ListUsersQueryVariables) =>
  useQuery({
    refetchOnMount: false,
    enabled: Boolean(queryVariable.filter),
    queryKey: ["userList", queryVariable.filter],
    queryFn: async () => {
      return await client.graphql({
        query: listUsers,
        variables: queryVariable,
      });
    },
  });

export const useCreateLeadContacts = () =>
  useMutation({
    mutationFn: async (inputVariable: any) => {
      try {
        const { data } = await client.graphql({
          query: customCreateContact,
          variables: {
            input: inputVariable,
          },
          authMode: "identityPool",
        });
        return data;
      } catch (e) {
        console.log("Error : ", e);
        throw new Error(JSON.stringify(e));
      }
    },
  });

export const useLeadNotificationTrigger = () =>
  useMutation({
    mutationFn: async (
      inputVariable: LeadNotificationTriggerQueryVariables,
    ) => {
      return await client.graphql({
        query: leadNotificationTrigger,
        variables: inputVariable,
        authMode: "userPool",
      });
    },
  });
export const useConvertLead = () =>
  useMutation({
    mutationFn: async (inputVariable: ConvertLeadMutationVariables) => {
      return await client.graphql({
        query: convertLead,
        variables: inputVariable,
        authMode: "userPool",
      });
    },
  });

export const useCloseLead = () =>
  useMutation({
    mutationFn: async (inputVariable: UpdateLeadMutationVariables) => {
      return await client.graphql({
        query: customUpdateLead,
        variables: inputVariable,
      });
    },
  });

export const useUpdateContact = () =>
  useMutation({
    mutationFn: async (inputVariable: UpdateContactInput) => {
      return await client.graphql({
        query: customUpdateContact,
        variables: {
          input: inputVariable,
        },
      });
    },
  });
export const useUpdateAddress = () =>
  useMutation({
    mutationFn: async (inputVariable: UpdateAddressInput) => {
      return await client.graphql({
        query: customUpdateAddress,
        variables: {
          input: inputVariable,
        },
      });
    },
  });
export const useCreateAddress = () =>
  useMutation({
    mutationFn: async (inputVariable: UpdateAddressInput) => {
      return await client.graphql({
        query: customUpdateAddress,
        variables: {
          input: inputVariable,
        },
      });
    },
  });

export const useUpdateDocument = () =>
  useMutation({
    mutationFn: async (inputVariable: UpdateDocumentInput) => {
      return await client.graphql({
        query: updateDocument,
        variables: {
          input: inputVariable,
        },
      });
    },
  });
export const useDeleteDocument = () =>
  useMutation({
    mutationFn: async (inputVariable: DeleteDocumentInput) => {
      return await client.graphql({
        query: deleteDocument,
        variables: {
          input: inputVariable,
        },
      });
    },
  });

export const useGetLeadDocuments = (
  queryVariable: ListDocumentsQueryVariables,
) =>
  useQuery({
    refetchOnMount: false,
    queryKey: ["GetLeadDocuments", queryVariable.filter],
    queryFn: async () => {
      return await client.graphql({
        query: listDocuments,
        variables: queryVariable,
      });
    },
  });
export const useGetPreSignedUrl = () =>
  useMutation({
    mutationFn: async (
      inputVariable: UploadDocumentPresignedUrlMutationVariables,
    ) => {
      return await client.graphql({
        query: uploadDocumentPresignedUrl,
        variables: {
          uId: inputVariable.uId,
          path: inputVariable.path,
          documentType: inputVariable.documentType,
        },
        authMode: "identityPool",
      });
    },
  });
export const useFileUploadIntoPreSignedUrl = () =>
  useMutation({
    mutationFn: async (payload: {
      preSignedUrl: string;
      file: File;
      defaultContentType: boolean;
    }) => {
      const response = await fetch(payload.preSignedUrl, {
        method: "PUT",
        body: payload.file,
        headers: {
          "Content-Type": payload.defaultContentType
            ? "application/octet-stream"
            : payload.file.type,
        },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to upload file ${response.status} ${response.statusText}`,
        );
      }
    },
  });

export const useCreateCustomAccountUser = () =>
  useMutation({
    mutationFn: async (inputVariable: CustomCreateAccountMutationVariables) => {
      return client.graphql({
        query: customCreateAccount,
        variables: inputVariable,
        authMode: "userPool",
      });
    },
  });

export const useCustomCreateUser = () =>
  useMutation({
    mutationFn: async (data: CustomCreateAccountMutationVariables) => {
      return client.graphql({
        query: customCreateUser,
        variables: data,
      });
    },
  });

export const useUpdateCustomAccountUser = () =>
  useMutation({
    mutationFn: async (inputVariable: UpdateAccountMutationVariables) => {
      return client.graphql({
        query: customUpdateAccount,
        variables: inputVariable,
        authMode: "userPool",
      });
    },
  });

export const useGetProductDetailsById = (productId: string) =>
  useQuery({
    enabled: !!productId,
    queryKey: ["GetProductDetailsById", productId],
    queryFn: async () => {
      return await client_with_token.graphql({
        query: customGetProduct,
        variables: {
          productId,
        },
      });
    },
  });

