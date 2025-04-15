import React, { useMemo, useState } from "react";
import { HiOutlineDownload } from "react-icons/hi";
import { MdOutlineFileUpload } from "react-icons/md";
import { FaRegCheckCircle } from "react-icons/fa";
import { ImCancelCircle } from "react-icons/im";
import DialogPopup from "../DialogBox";
import Button from "../Button";
import { FileUploaderWithAmplify } from "@/components/fileUploader";
import {
  useDeleteDocument,
  useGetLeadDocuments,
  useUpdateDocument,
} from "@/app/hooks/useQueryHooks";
import {
  DocumentVerificationStatus,
  ListDocumentsQueryVariables,
} from "@/app/graphql/API";
import { ShowFragment } from "@/components/ShowFragment";
import { Spinner } from "@/components/Spinner";
import { enumToDropdownData, formatFileSize } from "@/utils/helpers";
import { useQueryClient } from "@tanstack/react-query";
import { getUrl } from "@aws-amplify/storage";
import {
  documentVerificationStatusLevels,
  TEXT_CONSTANTS,
} from "@/utils/constants";
import { TbProgress, TbProgressAlert, TbProgressCheck } from "react-icons/tb";
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "../globalUIComponents";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import getFileIcon from "@/utils/getFileIcon";
import { deleteDocument } from "@/app/graphql/mutations";
import { onDeleteDocument } from "@/app/graphql/subscriptions";

const getStatusStyles = (status: string) => {
  switch (status) {
    case DocumentVerificationStatus.SUBMITTED:
      return {
        style:
          "border border-gray-400 bg-indigo-200 text-gray-800 px-2 rounded-lg flex justify-between items-center text-xs font-semibold leading-[16px] tracking-[0.06px]",
        icon: <TbProgressCheck size={14} className="ml-1 items-end" />,
      };
    case DocumentVerificationStatus.IN_PROGRESS:
      return {
        style:
          "border border-gray-400 bg-CornflowerBlue text-gray-800 px-2 rounded-lg flex justify-between items-center text-xs font-semibold leading-[16px] tracking-[0.06px]",
        icon: <TbProgressAlert size={14} className="ml-1 items-end" />,
      };
    case DocumentVerificationStatus.NOT_STARTED:
      return {
        style:
          "border border-gray-400 text-gray-800 px-2 rounded-lg flex justify-between items-center text-xs font-semibold leading-[16px] tracking-[0.06px]",
        icon: <TbProgress size={14} className="ml-1 items-end" />,
      };
    case DocumentVerificationStatus.VERIFIED:
      return {
        style:
          "bg-paleturquoise text-deepteal px-2 rounded-lg flex items-center text-xs font-semibold leading-[16px] tracking-[0.06px]",
        icon: <FaRegCheckCircle size={14} className="ml-1" />,
      };
    case DocumentVerificationStatus.REJECTED:
      return {
        style:
          "bg-red-100 text-red-800  px-2  rounded-lg flex items-center text-xs font-semibold leading-[16px] tracking-[0.06px]",
        icon: <ImCancelCircle size={15} className=" ml-1" />,
      };
    case DocumentVerificationStatus.RE_UPLOAD:
      return {
        style:
          " bg-slate-50 px-2 rounded-lg flex items-center text-xs font-semibold leading-[16px] tracking-[0.06px]",
        icon: <MdOutlineFileUpload size={15} className="ml-1" />,
      };
    default:
      return {
        style:
          "bg-gray-200 text-gray-700 p-2 rounded-lg flex items-center text-xs font-semibold",
        icon: null,
      };
  }
};

const sortOptions = [
  { id: "asc", label: TEXT_CONSTANTS.ASCENDING, icon: <FaSortAmountUp /> },
  { id: "desc", label: TEXT_CONSTANTS.DESCENDING, icon: <FaSortAmountDown /> },
];

const DocumentCollection = ({ leadId }: { leadId: string }) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(sortOptions[0]);
  const [sortByDate, setSortByDate] = useState(true);

  const filteredDocumentStatus = (
    currentStatus: DocumentVerificationStatus,
  ) => {
    const currentLevel =
      documentVerificationStatusLevels[
        currentStatus as DocumentVerificationStatus
      ];
    return enumToDropdownData(DocumentVerificationStatus)
      .map((item) => ({
        ...item,
        level:
          documentVerificationStatusLevels[
            item.value as DocumentVerificationStatus
          ],
      }))
      .filter((item) => {
        const itemLevel = item.level || 1;
        return itemLevel >= currentLevel;
      });
  };
  const [filter] = useState<ListDocumentsQueryVariables>({
    filter: {
      uId: {
        eq: leadId,
      },
    },
    limit: 999,
  });
  const updateDocumentMutate = useUpdateDocument();
  const listDocuments = useGetLeadDocuments(filter);
  const handleStatusUpdate = async ({
    docId,
    leadId,
    newStatus,
  }: {
    docId: string;
    leadId: string;
    newStatus: DocumentVerificationStatus;
  }) => {
    await updateDocumentMutate.mutateAsync(
      {
        documentId: docId,
        uId: leadId,
        verificationStatus: newStatus,
      },
      {
        onError: (error) => {
          console.error("Error updating document status", error);
        },
        onSuccess: (data) => {
          const key = {
            uId: {
              eq: data.data.updateDocument.uId,
            },
          };
          // Update the existing cached data without refetching
          queryClient.setQueryData(
            ["GetLeadDocuments", key],
            (oldData: any) => {
              if (!oldData) return oldData;
              // console.log("data updated successfully", { oldData, data });
              // Assuming the API response 'data' contains the updated document or data
              const res = oldData?.data?.listDocuments?.items?.map(
                (oldDocData: any) =>
                  oldDocData.documentId === docId
                    ? {
                        ...oldDocData,
                        ...data.data.updateDocument,
                      }
                    : oldDocData,
              );
              return {
                data: {
                  ...oldData,
                  listDocuments: {
                    ...oldData.listDocuments,
                    items: res,
                  },
                },
              };
            },
          );
        },
      },
    );
  };

  const handleFileDownload = async (path: string) => {
    try {
      // Fetch the signed URL
      const linkToStorageFile = await getUrl({ path });
      console.log("URL expires at: ", linkToStorageFile.expiresAt);
      // Open the signed URL in a new tab
      window.open(linkToStorageFile.url, "_blank");
    } catch (error) {
      console.error("Error downloading the file: ", error);
    }
  };
  const sortedDocuments = useMemo(() => {
    if (
      !listDocuments ||
      !listDocuments.data ||
      !listDocuments.data.data ||
      !listDocuments.data.data.listDocuments ||
      !listDocuments.data.data.listDocuments.items
    ) {
      return [];
    }
    const documents = [...listDocuments.data.data.listDocuments.items];
    console.log("documents: ", documents);
    if (sortByDate) {
      return documents.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    } else {
      return documents.sort((a, b) => {
        if (selected.id === "asc") {
          return a.docDisplayName.localeCompare(b.docDisplayName);
        } else {
          return b.docDisplayName.localeCompare(a.docDisplayName);
        }
      });
    }
  }, [selected, listDocuments, sortByDate]);
  console.log("sortedDocuments: ", sortedDocuments);

  const hasDocuments = !!(
    listDocuments?.data?.data?.listDocuments?.items &&
    listDocuments?.data?.data?.listDocuments?.items?.length > 0
  );
  const deleteDocumentMutate = useDeleteDocument();

  const handleRemove = async (documentId: string, uId: string) => {
    console.log("uId", uId);
    try {
      await deleteDocumentMutate.mutateAsync(
        { documentId, uId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GetLeadDocuments"] });
          },
          onError: (error) => {
            console.error("Hard delete failed:", error);
          },
        }
      );
    } catch (err) {
      console.error("Error hard-deleting document", err);
    }
  };

  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-4  border-gray-200">
        <div className="flex items-center w-1/2 space-x-4">
          <h1 className="text-xl font-semibold">Document Collection</h1>
          <div className="py-3">
            <Dropdown>
              <DropdownButton className="cursor-pointer">
                <span className="flex items-center gap-3 px-2 min-w-14 rounded-md border border-gray-600 text-black">
                  {TEXT_CONSTANTS.SORT}
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="-mr-1 size-5 text-gray-400"
                  />
                </span>
              </DropdownButton>
              <DropdownMenu
                className={cn("!bg-aliceblue mt-2")}
                anchor="bottom start"
              >
                <DropdownItem
                  onClick={() => {
                    setSelected(sortOptions[0]);
                    setSortByDate(false);
                  }}
                >
                  <FaSortAmountUp className="size-3 mx-2" />
                  <DropdownLabel>{TEXT_CONSTANTS.ASCENDING}</DropdownLabel>
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    setSelected(sortOptions[1]);
                    setSortByDate(false);
                  }}
                >
                  <FaSortAmountDown className="size-3 mx-2" />
                  <DropdownLabel>{TEXT_CONSTANTS.DESCENDING}</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-center gap-6 ">
          <span
            className="text-blue-600 cursor-pointer font-semibold"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Upload
          </span>
          <span
            className={`${
              hasDocuments
                ? "text-blue-600 cursor-pointer font-semibold"
                : "text-gray-400 cursor-not-allowed"
            }`}
            onClick={hasDocuments ? () => {} : undefined}
          >
            Download All
          </span>
        </div>
      </div>
      <ShowFragment>
        <ShowFragment.When
          isTrue={
            listDocuments.isLoading ||
            listDocuments.isFetching ||
            listDocuments.isRefetching
          }
        >
          <div className="w-full py-4">
            <div className="bg-gray-100 rounded-md">
              <div className="text-black text-opacity-40 text-lg w-fit text-center  font-semibold p-24 m-auto">
                <Spinner />
              </div>
            </div>
          </div>
        </ShowFragment.When>
      </ShowFragment>
      <ShowFragment>
        <ShowFragment.When
          isTrue={
            listDocuments.isSuccess &&
            !listDocuments.isLoading &&
            !listDocuments.isRefetching &&
            !listDocuments.isFetching
          }
        >
          <ShowFragment>
            <ShowFragment.When
              isTrue={
                !!(
                  listDocuments?.data?.data?.listDocuments?.items &&
                  listDocuments?.data?.data?.listDocuments?.items?.length > 0
                )
              }
            >
              <div className="overflow-y-auto max-h-96">
                {sortedDocuments.map((file) => {
                  const { style, icon } = getStatusStyles(
                    file?.verificationStatus as string,
                  );
                  return (
                    <div
                      key={file.documentId}
                      className="flex justify-between items-center p-3 mb-3 rounded-md border bg-aliceblue border-amethyst bg-purple-25 opacity-6"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white border rounded-lg border-gray-300 flex justify-center items-center shadow-custom-light">
                          {getFileIcon(file.docDisplayName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-base text-gray-800 leading-[24px] tracking-[0.08px]">
                            {file.docDisplayName}
                          </span>
                          <div>
                            <span className="text-gray-500 text-xs font-medium leading-[16px] tracking-[0.06px]">
                              {formatFileSize(file.fileSize || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Status Label with icon */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-4">
                          <div className={`relative inline-block ${style}`}>
                            {icon}
                            <select
                              className={`appearance-none p-2 pr-0  rounded-lg bg-transparent focus:outline-none`}
                              value={file.verificationStatus || ""}
                              onChange={(e) =>
                                handleStatusUpdate({
                                  leadId: file.uId,
                                  docId: file.documentId,
                                  newStatus: e.target
                                    .value as DocumentVerificationStatus,
                                })
                              }
                            >
                              {filteredDocumentStatus(
                                file.verificationStatus as DocumentVerificationStatus,
                              ).map((field) => (
                                <option key={field.value} value={field.value}>
                                  {field.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Button
                            type={"button"}
                            variant="outlineNone"
                            size="sm"
                            onClick={() =>
                              handleFileDownload(file?.documentUrl || "")
                            }
                          >
                            <HiOutlineDownload />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            color="white"
                            onClick={() =>
                              handleRemove(file.documentId, file.uId)
                            }

                          >
                            Remove
                          </Button>
                          {/*<a*/}
                          {/*  href={linkToStorageFile.url.toString()}*/}
                          {/*  target="_blank"*/}
                          {/*  rel="noreferrer"*/}
                          {/*>*/}
                          {/*  {fileName}*/}
                          {/*</a>*/}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ShowFragment.When>
            <ShowFragment.Else>
              <div className="w-full py-4">
                <div className="bg-gray-100 rounded-md">
                  <div className="text-black text-opacity-40 text-lg text-center font-semibold p-24 m-auto">
                    No documents have been uploaded, please upload the documents
                    here
                  </div>
                </div>
              </div>
            </ShowFragment.Else>
          </ShowFragment>
        </ShowFragment.When>
        <ShowFragment.When isTrue={listDocuments.isError}>
          <div className="w-full py-4">
            <div className="bg-red-100 rounded-md">
              <div className="text-red-600 text-lg text-center font-semibold p-24 m-auto">
                {listDocuments?.error?.message || "Unknown error"}
              </div>
            </div>
          </div>
        </ShowFragment.When>
      </ShowFragment>
      <ShowFragment>
        <ShowFragment.When isTrue={isOpen}>
          <DialogPopup
            open={isOpen}
            onClose={() => {
              setIsOpen(false);
              setTimeout(() => {
                queryClient.invalidateQueries({
                  queryKey: ["GetLeadDocuments"],
                });
              }, 100);
            }}
            title="List of Required Documents"
            content={<FileUploaderWithAmplify leadId={leadId} />}
            variant="default"
            className="max-h-max overflow-auto"
            width="w-[50%]"
          />
        </ShowFragment.When>
      </ShowFragment>
    </div>
  );
};

export default DocumentCollection;
