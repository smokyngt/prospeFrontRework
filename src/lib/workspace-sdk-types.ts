/**
 * Common pagination parameters for list endpoints.
 */
export type PaginationParams = {
  /** Cursor for cursor-based pagination (base64-encoded item ID). */
  cursor?: string;
  /** Maximum number of items per page. */
  limit?: number;
  /** Number of items to skip for offset-based pagination. */
  skip?: number;
  /** Sort order by creation date. */
  order?: 'asc' | 'desc';
}

/**
 * Date range filter for list endpoints.
 */
export type DateFilter = {
  /** End date (ISO string or Unix timestamp in ms). */
  end?: number | string;
  /** Start date (ISO string or Unix timestamp in ms). */
  start?: number | string;
}

/**
 * @internal
 */
export type ApiResponse<T> = {
  data: T;
  event: {
    code: string;
  };
}

/**
 * Generic success response for operations without data.
 */
export type SuccessResponse = {
  /** Whether the operation was successful. */
  success: boolean;
}

/**
 * A knowledge store that can answer questions using uploaded documents.
 */
export type Store = {
  /** User ID or ApiKey Id (actor) who created the store. */
  actor: string;
  /** Unix timestamp (ms) when the store was created. */
  createdAt: number;
  /** Description of the store. */
  description?: string;
  /** Unique identifier for the store. */
  id: string;
  /** Display name of the store. */
  name: string;
  /** Object type identifier. */
  object: 'store';
  /** Organization ID this store belongs to. */
  organization: string;
  /** Unix timestamp (ms) when the store was last updated. */
  updatedAt?: number;
}

/**
 * Parameters for creating a new store.
 */
export type CreateStoreParams = {
  /** Description of the store. */
  description?: string;
  /** Name for the store. */
  name: string;
}

/**
 * Parameters for updating a store.
 */
export type UpdateStoreParams = {
  /** Description of the store's purpose. */
  description?: string;
  /** New name for the store. */
  name?: string;
}

/**
 * Parameters for listing stores.
 */
export type ListStoresParams = {} & PaginationParams

/**
 * Response from listing stores.
 */
export type ListStoresResponse = {
  /** Array of stores. */
  items: Store[];
  /** Whether there are more results. */
  more: boolean;
  /** Cursor for the next page. */
  next?: string;
  /** Total number of items. */
  total: number;
}

/**
 * Response from creating a store.
 */
export type CreateStoreResponse = {
  /** The created store. */
  store: Store;
}

/**
 * Response from retrieving a store.
 */
export type RetrieveStoreResponse = {
  /** The store. */
  store: Store;
}

export type ToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export type ToolResponse = {
  error?: string;
  id: string;
  name: string;
  result?: unknown;
}

export type ToolUse = {
  function: {
    name: string;
    arguments: string;
  };
  id: string;
  response?: unknown;
  type: 'function';
}

export type ReasoningStep = {
  content: string;
  toolCallId?: string;
}

export type OrchestrationStep = {
  /** The action taken during this step (search, read, compressing, generate, etc.). */
  action: string;
  /** Number of candidate chunks before sorting. */
  candidates?: number;
  /** Number of chunks retrieved or processed. */
  chunks?: number;
  /** Milliseconds this step took to complete. */
  duration?: number;
  /** Named entities extracted from the query (names, IDs, dates, products). */
  entities?: string[];
  /** Tool call details (matching OpenAI function format). */
  function?: {
    name: string;
    arguments: string;
  };
  /** String identifier (4-digit alias). */
  id?: string;
  /** Queries used for retrieval. */
  queries?: string[];
  /** Reasoning text describing what the agent is doing. */
  reasoning?: string;
  /** Result of executing the tool call. */
  toolResponse?: unknown;
  /** Number of chunks kept after sorting. */
  results?: number;
  /** Milliseconds from the start of the request until this step began. */
  startedAt?: number;
  /** Chain-of-thought reasoning from the model's thinking process. */
  thinking?: string;
}

export type Message = {
  actor: string;
  /** Citations linking this response to source documents. */
  citations?: Citation[];
  /** Multiple-choice options for clarifying questions. */
  clarifyOptions?: string[];
  /** Parallel array to clarifyOptions - true when the option requires the user to provide additional free-text input. */
  clarifyInputRequired?: boolean[];
  /** The text content of the message. */
  content: string;
  createdAt: number;
  feedback?: MessageFeedback;
  /** Snapshot of the file and folder filters active when the message was sent. */
  filterSelection?: {
    fileIds?: string[];
    files?: Array<{ id: string; name: string }>;
    folderIds?: string[];
    folders?: Array<{ id: string; name: string }>;
  };
  /** Detected hallucinations in the response. */
  hallucinations?: Hallucination[];
  id: string;
  /** Terminal state of the assistant turn, used to surface localized UI text. */
  finishReason?: 'blocked' | 'completed' | 'error';
  /** True when retrieval produced no relevant document context and the store used a fallback answer. */
  noSource?: boolean;
  object: 'thread.message';
  /** Orchestration steps taken during retrieval and generation. */
  orchestration?: OrchestrationStep[];
  organization: string;
  /** Reasoning steps taken by the store. */
  reasoning?: ReasoningStep[];
  regeneratedFrom?: string;
  role: 'assistant' | 'tool' | 'user';
  /** Store IDs this message drew context from. */
  storeIds?: string[];
  threadId: string;
  /** Tool calls made by this message (assistant role only), each with its function signature and result. */
  tools?: ToolUse[];
  tokens?: null | number;
}

export type ArchivalState = {
  at?: number;
  by?: string;
  status: boolean;
}

export type ThreadArchival = ArchivalState;

/**
 * A conversation thread containing messages.
 */
export type Thread = {
  /** User ID or ApiKey Id (actor) who created the thread. */
  actor: string;
  /** Archival status. */
  archival: ThreadArchival;
  /** Store IDs this thread is associated with. */
  storeIds: string[];
  /** Unix timestamp (ms) when the thread was created. */
  createdAt: number;
  /** Unique identifier for the thread. */
  id: string;
  /** Messages in the thread. */
  messages: Message[];
  /** Object type identifier. */
  object: 'thread';
  /** Organization ID. */
  organization: string;
  /** Auto-generated or user-set title. */
  title: string;
  /** Unix timestamp (ms) when the thread was last updated. */
  updatedAt?: number;
}

/**
 * Parameters for creating a new thread.
 */
export type CreateThreadParams = {
  /** Store IDs to associate with this thread (at least one required). */
  storeIds: string[];
}

/**
 * Parameters for listing threads.
 */
export type ListThreadsParams = {
  /** Filter by archived status. */
  archived?: boolean;
  /** Filter by store ID. */
  storeId?: string;
  /** Filter by creation date range. */
  date?: DateFilter;
  /** Filter by user ID who created the thread. */
  userId?: string;
} & PaginationParams

/**
 * Response from listing threads.
 */
export type ListThreadsResponse = {
  /** Array of threads. */
  items: Thread[];
  /** Whether there are more results. */
  more: boolean;
  /** Cursor for the next page. */
  next?: string;
  /** Total number of items. */
  total: number;
}

/**
 * Response from creating a thread.
 */
export type CreateThreadResponse = {
  /** The created thread. */
  thread: Thread;
}

/**
 * Response from retrieving a thread.
 */
export type RetrieveThreadResponse = {
  /** The thread with messages. */
  thread: Thread;
}

/**
 * Parameters for updating a thread's associated stores.
 */
export type UpdateThreadParams = {
  /** UUIDs of the stores to associate with this thread (at least one required). */
  storeIds: string[];
}

/**
 * Response from updating a thread.
 */
export type UpdateThreadResponse = {
  /** The updated thread. */
  thread: Thread;
}

/**
 * Parameters for sending a chat message.
 */
export type SendMessageParams = {
  /** Store IDs to use for retrieval (optional). */
  storeIds?: string[];
  /** Maximum orchestration rounds the orchestrator may run (5-50). Values outside the range are clamped. */
  effort?: number;
  /** Whether to extract entities from retrieved documents. */
  entities?: boolean;
  /** Specific file IDs to search (optional). */
  fileIds?: string[];
  /** Folder IDs selected by the user for chat scoping (optional). */
  folderIds?: string[];
  /** Metadata filters for document retrieval. */
  filters?: Record<string, unknown>;
  /** Maximum number of chunks to retrieve (default: 10). */
  limit?: number;
  /** Whether to stream the response. */
  stream?: boolean;
  /** The message text to send. */
  text: string;
  /** Thread ID to send the message to. */
  thread: string;
}

/**
 * A citation linking a response to source documents.
 */
export type Citation = {
  /** The span of the AI answer that this citation supports. */
  answer: string;
  /** Multiple bounding boxes for citations spanning several layout regions on the same page. */
  bboxes?: number[][];
  /** Unique identifier for the chunk. */
  chunkId: string;
  /** Model-reported relevance score (0-1) for this citation. Uncalibrated self-assessment, not a probability. */
  confidence: number;
  /** End character index in the response text when available. */
  end?: number;
  /** Source document passage that proves this claim. */
  evidence?: string;
  /** Source file ID. */
  fileId?: string;
  /** Source file name. */
  fileName?: string;
  /** Page ID within the document. */
  pageId?: string;
  /** Page number in the document. */
  pageNumber?: number;
  /** Original vector retrieval score. */
  retrievalScore?: number;
  /** Start character index in the response text when available. */
  start?: number;
  /** Citation kind for visual evidence such as figures or tables. */
  type?: 'figure' | 'table';
}

/**
 * A detected hallucination in the response.
 */
export type Hallucination = {
  /** Chunk containing the excerpt that contradicts the claim. */
  chunkId?: string;
  /** End character index in the response. */
  end: number;
  /** Verbatim document excerpt contradicting the claim. */
  evidence?: string;
  /** Explanation of why this was flagged. */
  reason: string;
  /** Hallucination confidence score (0-1). */
  score: number;
  /** Start character index in the response. */
  start: number;
}

/**
 * Response from sending a chat message.
 */
export type SendMessageResponse = {
  /** Citations linking response to source documents. */
  citations?: Citation[];
  /** Detected hallucinations in the response. */
  hallucinations?: Hallucination[];
  /** The AI generated response text. */
  response: string;
}

/**
 * Status of a server-side SSE stream for a thread.
 */
export type StreamStatusResponse = {
  /** Whether the stream is actively generating on the server. */
  active: boolean;
  /** Whether there are buffered events available for replay. */
  buffered: boolean;
}

/**
 * Parameters for regenerating a message.
 * All fields are optional - they override the defaults derived from the original message's thread.
 */
export type RegenerateParams = {
  /** Override the store IDs used for retrieval. */
  storeIds?: string[];
  /** Maximum orchestration rounds the orchestrator may run (5-50). Values outside the range are clamped. */
  effort?: number;
  /** Override specific file IDs to search. */
  fileIds?: string[];
  /** Folder IDs selected by the user for chat scoping. */
  folderIds?: string[];
  /** Metadata filters for document retrieval. */
  filters?: Record<string, unknown>;
  /** Maximum number of chunks to retrieve. */
  limit?: number;
  /** Whether to stream the response. */
  stream?: boolean;
}

/**
 * Response from editing a message.
 */
export type EditMessageResponse = {
  /** Timestamp of the edit. */
  editedAt: number;
  /** The edited message's ID. */
  id: string;
  /** The updated message content. */
  text: string;
}

/**
 * Response from regenerating a message.
 */
export type RegenerateMessageResponse = {
  /** Citations linking response to source documents. */
  citations?: Citation[];
  /** Detected hallucinations in the response. */
  hallucinations?: Hallucination[];
  /** The regenerated AI response text. */
  response: string;
}

/**
 * Response from uploading documents.
 */
export type UploadDocumentsResponse = {
  /** IDs of every file record created by this upload, in the same order as the submitted files. */
  files: string[];
}

/**
 * Current lifecycle status of an upload session.
 */
export type UploadStatus =
  | 'cancelled'
  | 'complete'
  | 'failed'
  | 'ingesting'
  | 'pending'
  | 'uploading';

/**
 * An upload session returned by the upload lifecycle endpoints.
 */
export type Upload = {
  /** Upload session ID. */
  id: string;
  /** Object type identifier (always `'upload'`). */
  object: string;
  /** UUID of the organization that owns the upload. */
  organizationId: string;
  /** UUID of the store the upload is associated with. */
  storeId: string;
  /** Current status of the upload. */
  status: UploadStatus;
  /** Total number of bytes to upload. */
  totalBytes: number;
  /** Creation timestamp. */
  createdAt: number;
  /** Last update timestamp. */
  updatedAt?: number;
  /** Maximum allowed bytes for the upload. */
  maxBytes?: number;
  /** UUID of the actor who created the upload. */
  actorId?: string;
  /** UUID of the folder the completed files will be placed in. */
  folderId?: string;
  /** Date when the upload expires. */
  expiresAt?: string;
  /** Files declared for this upload session. */
  items?: UploadItem[];
}

/**
 * Current lifecycle status of an upload session item.
 */
export type UploadItemStatus =
  | 'complete'
  | 'error'
  | 'failed'
  | 'ingesting'
  | 'pending'
  | 'stored'
  | 'uploading';

/**
 * A contiguous range of bytes that has been accepted for an upload item.
 */
export type UploadAcceptedByteRange = {
  /** Zero-based start byte of the accepted range. */
  start: number;
  /** Zero-based end byte of the accepted range. */
  end: number;
}

/**
 * A single file declared within an upload session.
 */
export type UploadItem = {
  /** Item ID, used as the target of part uploads. */
  id: string;
  /** Name of the file. */
  fileName: string;
  /** MIME type of the file. */
  mimeType: string;
  /** Size of the file in bytes. */
  size: number;
  /** Current status of the item. */
  status: UploadItemStatus;
  /** Object storage key where the item's parts are stored. */
  storageKey: string;
  /** File record created once the item is completed. */
  fileId?: string;
  /** Byte ranges already accepted for this item. */
  acceptedByteRanges?: UploadAcceptedByteRange[];
  /** Error message for failed items. */
  error?: string;
  /** Optional per-item metadata. */
  metadata?: Record<string, unknown>;
}

/**
 * A file to declare when creating an upload session.
 */
export type CreateUploadItem = {
  /** Name of the file to upload. */
  fileName: string;
  /** MIME type of the file to upload. */
  mimeType: string;
  /** Size of the file in bytes. */
  size: number;
  /** Optional metadata to associate with the file. */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for creating a new upload session.
 */
export type CreateUploadParams = {
  /** UUID of the store to associate the upload with. */
  storeId: string;
  /** Total number of bytes to upload. */
  totalBytes: number;
  /** Optional UUID of the folder to place uploaded files in. */
  folderId?: string;
  /** Optional files to declare for this upload session. */
  items?: CreateUploadItem[];
}

/**
 * Response from creating or retrieving an upload session.
 */
export type UploadResponse = {
  upload: Upload;
}

/**
 * Parameters for completing an upload session.
 */
export type CompleteUploadParams = {
  /** Optional UUID of the folder to place the completed files in. */
  folderId?: string;
  /** Optional metadata to associate with the completed files. */
  metadata?: Record<string, unknown>;
}

/**
 * Response from completing an upload session.
 */
export type CompleteUploadResponse = {
  /** IDs of the file records created by this upload, in the order of the declared items. */
  files: string[];
}

/**
 * Parameters for listing upload sessions.
 */
export type ListUploadsParams = {
  /** Cursor for cursor-based pagination. */
  cursor?: string;
  /** Maximum number of uploads to return (1-100). */
  limit?: number;
  /** Sort order for the results. */
  order?: 'asc' | 'desc';
  /** Number of items to skip. */
  skip?: number;
  /** Filter by upload status. */
  status?: UploadStatus;
  /** Filter by store UUID. */
  storeId?: string;
}

/**
 * Response from listing upload sessions.
 */
export type ListUploadsResponse = {
  items: Upload[];
  more: boolean;
  next?: string;
  total: number;
}

/**
 * Per-status counts returned by the upload poll endpoint.
 */
export type UploadPollItem = {
  status: string;
  count: number;
}

/**
 * Response from polling an upload session's processing status.
 */
export type PollUploadResponse = {
  status: string;
  items: UploadPollItem[];
}

/**
 * Archival status for a file.
 */
export type FileArchival = ArchivalState;

/**
 * An entity extracted from a document.
 */
export type FileEntity = {
  /** Page ID where the entity was found. */
  pageId: string;
  /** Page number (1-indexed). */
  pageNumber: number;
  /** Confidence score for extraction. */
  score?: number;
  /** The entity text. */
  text: string;
  /** Entity type (e.g., 'person', 'organization', 'date'). */
  type?: string;
}

export type FilePreview = {
  /** MIME type of the derived preview artifact. */
  contentType?: string;
  /** Preview artifact size in bytes. */
  size: number;
}

/**
 * An uploaded document file.
 */
export type File = {
  /** User ID or ApiKey Id (actor) who uploaded the file. */
  actor: string;
  /** Archival status. */
  archival: FileArchival;
  /** Store ID this file belongs to. */
  store: string;
  /** Unix timestamp (ms) when the file was created. */
  createdAt: number;
  /** Extracted entities from the document. */
  entities?: FileEntity[];
  /** Folder ID if organized in a folder. */
  folder?: null | string;
  /** Unique identifier for the file. */
  id: string;
  /** Custom metadata attached to the file. */
  metadata?: Record<string, unknown>;
  /** MIME type of the uploaded file. */
  mimeType: string;
  /** Original filename. */
  name: string;
  /** Object type identifier. */
  object: 'file';
  /** Organization ID. */
  organization: string;
  /** Number of pages (for documents). */
  pages?: null | number;
  /** Derived inline preview metadata when a preview artifact is available. */
  preview?: FilePreview;
  /** File size in bytes. */
  size: number;
  /** Processing status. */
  status: 'complete' | 'embedding' | 'error' | 'indexing' | 'loading' | 'storing';
  /** Unix timestamp (ms) when the file was last updated. */
  updatedAt?: number;
}

/**
 * Parameters for listing files.
 */
export type ListFilesParams = {
  /** Include archived files. */
  archived?: boolean;
  /** Filter by store ID. */
  storeId?: string;
  /** Filter by creation date range. */
  date?: DateFilter;
  /** Filter by folder ID. */
  folderId?: string;
  /** Filter by page count range. */
  pages?: { max?: number; min?: number };
  /** Only return files that are not inside a folder. */
  root?: boolean;
  /** Search by filename. */
  search?: { name?: string };
  /** Filter by file size range (bytes). */
  size?: { max?: number; min?: number };
  /** Filter by processing status. */
  status?: 'complete' | 'embedding' | 'error' | 'indexing' | 'loading' | 'storing';
} & PaginationParams

/**
 * Parameters for searching files.
 */
export type SearchFilesParams = {
  /** Limit search to specific stores. */
  storeIds?: string[];
  /** Entity text to search for (when mode is 'entity'). */
  entity?: string;
  /** Maximum number of results. */
  limit?: number;
  /** Metadata key to search (when mode is 'metadata_key'). Provide metadataValue for exact match. */
  metadataKey?: string;
  /** Metadata value to match (optional; when set, performs key-value match). */
  metadataValue?: boolean | null | number | string;
  /** Search mode: by entity or metadata key (provide metadataValue for exact match). */
  mode: 'entity' | 'metadata_key';
}

/**
 * Response from listing files.
 */
export type ListFilesResponse = {
  /** Array of files. */
  items: File[];
  /** Whether there are more results. */
  more: boolean;
  /** Cursor for the next page. */
  next?: string;
  /** Total number of items. */
  total: number;
}

/**
 * A single indexed chunk stored in the database.
 */
export type FileChunk = {
  assetKey?: string;
  bboxes?: number[][];
  content: string;
  entities?: Array<{ score?: number; text: string; type?: string }>;
  id: string;
  metadata?: Record<string, unknown>;
  pageId: string;
  pageNumber: number;
  pointId: string;
  retrievalCount: number;
  type: string;
}

/**
 * Parameters for listing file chunks.
 */
export type ListFileChunksParams = {} & PaginationParams

/**
 * Response from listing file chunks.
 */
export type ListFileChunksResponse = {
  /** Array of chunks for the file. */
  items: FileChunk[];
  /** Whether there are more results. */
  more: boolean;
  /** Cursor for the next page. */
  next?: string;
  /** Total number of items. */
  total: number;
}

/**
 * Response from searching files.
 */
export type SearchFilesResponse = {
  /** Matching files. */
  items: File[];
}

/**
 * Response from retrieving a file.
 */
export type RetrieveFileResponse = {
  /** The file with metadata. */
  file: File;
}

/**
 * Response from archiving a file.
 */
export type ArchiveFileResponse = {
  /** Whether the archive was successful. */
  success: boolean;
}

/**
 * Response from restoring a file.
 */
export type RestoreFileResponse = {
  /** Whether the restore was successful. */
  success: boolean;
}

/**
 * Response from repairing a file.
 */
export type RepairFileResponse = {
  /** Whether the repair was successfully queued. */
  success: boolean;
}

/**
 * Parameters for updating a file.
 */
export type UpdateFileParams = {
  /** New folder ID to move the file to. */
  folderId?: string | null;
  /** New name for the file. */
  name?: string;
}

/**
 * Response from updating a file.
 */
export type UpdateFileResponse = {
  /** Whether the update was successful. */
  success: boolean;
}

/**
 * Archival status for a folder.
 */
export type FolderArchival = ArchivalState;

/**
 * A folder for organizing files.
 */
export type Folder = {
  /** User ID who created the folder. */
  actor: string;
  /** Archival status. */
  archival: FolderArchival;
  /** Store ID this folder belongs to. */
  store: string;
  /** Unix timestamp (ms) when the folder was created. */
  createdAt: number;
  /** File IDs contained in this folder. */
  files: string[];
  /** Parent folder ID for nested folders. */
  folder?: null | string;
  /** Unique identifier for the folder. */
  id: string;
  /** Folder name. */
  name: string;
  /** Object type identifier. */
  object: 'folder';
  /** Organization ID. */
  organization: string;
  /** Unix timestamp (ms) when the folder was last updated. */
  updatedAt?: number;
}

/**
 * Parameters for creating a new folder.
 */
export type CreateFolderParams = {
  /** Store ID to create the folder in. */
  storeId: string;
  /** Folder name. */
  name: string;
  /** Parent folder ID for nested folders. */
  parentId?: string;
}

/**
 * Parameters for updating a folder.
 */
export type UpdateFolderParams = {
  /** Reassign to a different store. */
  store?: string;
  /** Move to a different parent folder (null = root). */
  folder?: null | string;
  /** New folder name. */
  name?: string;
}

/**
 * Parameters for listing folders.
 */
export type ListFoldersParams = {
  /** Include archived folders. */
  archived?: boolean;
  /** Filter by store ID. */
  storeId?: string;
  /** Filter by creation date range. */
  date?: DateFilter;
  /** Filter by parent folder ID. */
  parentId?: string;
  /** Only return root-level folders. */
  root?: boolean;
} & PaginationParams

/**
 * Response from listing folders.
 */
export type ListFoldersResponse = {
  /** Array of folders. */
  items: Folder[];
  /** Whether there are more results. */
  more: boolean;
  /** Cursor for the next page. */
  next?: string;
  /** Total number of items. */
  total: number;
}

/**
 * Response from creating a folder.
 */
export type CreateFolderResponse = {
  /** The created folder. */
  folder: Folder;
}

/**
 * Response from retrieving a folder.
 */
export type RetrieveFolderResponse = {
  /** The folder. */
  folder: Folder;
}

/**
 * Response from archiving a folder.
 */
export type ArchiveFolderResponse = {
  /** Whether the operation succeeded. */
  success: boolean;
}

/**
 * Response from restoring a folder.
 */
export type RestoreFolderResponse = {
  /** The restored folder. */
  folder: Folder;
}

/**
 * Current billing plan and limit response.
 */
export type BillingPlanResponse = {
  client: {
    id: string;
    limits?: Record<string, number>;
    overage: boolean;
    pricingPlanId?: string;
    status: string;
  };
  effectiveLimits: Record<string, number>;
  limits: Record<string, number>;
  plan?: unknown;
  pricing: {
    components: Array<{ description?: string; name: string; unitPrice: number }>;
    currency: string;
    description?: string;
    id: string;
    name: string;
  } | null;
  usage: Record<string, number>;
}

export type BillingInvoice = {
  client: string;
  createdAt: number;
  currency: string;
  dueDate: number;
  id: string;
  number: string;
  status: 'draft' | 'overdue' | 'paid' | 'sent' | 'void';
  total: number;
  updatedAt: number;
}

export type BillingInvoiceListResponse = {
  more: boolean;
  items: BillingInvoice[];
  next?: string;
  total: number;
}

export type BillingInvoiceListParams = {
  cursor?: string;
  date?: {
    end?: number | string;
    start?: number | string;
  };
  limit?: number;
  order?: 'asc' | 'desc';
  skip?: number;
  sort?: string;
}

/**
 * Usage limits for an organization.
 */
export type OrganizationLimits = {
  /** Maximum number of stores. */
  stores?: number;
  /** Maximum number of files. */
  files?: number;
  /** Maximum number of team members. */
  members?: number;
  /** Maximum tokens per billing period. */
  tokens?: number;
}

/**
 * Archival status for an organization.
 */
export type OrganizationArchival = ArchivalState;

/**
 * An organization (team or company).
 */
export type Organization = {
  /** User ID who created the organization. */
  actor: string;
  /** Archival status. */
  archival: OrganizationArchival;
  /** Unix timestamp (ms) when the organization was created. */
  createdAt: number;
  /** Billing client linkage. The full API key is never returned. */
  billing?: {
    /** Billing client ID. */
    clientId?: string;
  };
  /** Unique identifier for the organization. */
  id: string;
  /** Usage limits. */
  limits: OrganizationLimits;
  /** Organization name. */
  name: string;
  /** Object type identifier. */
  object: 'organization';
  /** OTP configuration. */
  otp?: {
    /** Controls who can enroll OTP: 'allowed' lets any member, 'owner-only' restricts to owner. */
    policy: 'allowed' | 'owner-only';
  };
  /** Whether overage billing is enabled. */
  overage: boolean;
  /** SSO configuration. */
  sso: { enabled: boolean };
  /** SAML configuration. */
  saml: { enabled: boolean };
  /** Unix timestamp (ms) when the organization was last updated. */
  updatedAt?: number;
}

/**
 * Parameters for creating an organization.
 */
export type CreateOrganizationParams = {
  /** Organization name. */
  name: string;
}

/**
 * SSO configuration for updating an organization.
 */
export type SsoConfig = {
  /** List of email domains allowed for SSO login. */
  allowedDomains?: string[];
  /** OAuth client ID from your identity provider. */
  clientId?: string;
  /** OAuth client secret from your identity provider. */
  clientSecret?: string;
  /** Whether SSO is enabled for this organization. */
  enabled?: boolean;
  /** OIDC issuer URL from your identity provider. */
  issuer?: string;
}

/**
 * SAML configuration for updating an organization.
 */
export type SamlConfig = {
  /** List of email domains allowed for SAML login. */
  allowedDomains?: string[];
  /** ACS assertion consumer service URL (optional). */
  assertionUrl?: string;
  /** X.509 certificate content from your identity provider. */
  certificate?: string;
  /** Whether SAML is enabled for this organization. */
  enabled?: boolean;
  /** SAML identity provider entry point / SSO URL. */
  entryPoint?: string;
  /** Service provider entity ID / audience URI. */
  entityId?: string;
  /** Display name shown to users on the IdP login page. */
  providerName?: string;
  /** Require admin approval for new SAML-provisioned users. */
  requireAdminApproval?: boolean;
}

/**
 * Parameters for updating an organization.
 */
export type UpdateOrganizationParams = {
  /** New organization name. */
  name?: string;
  /** OTP configuration. */
  otp?: {
    /** Controls who can enroll OTP. */
    policy: 'allowed' | 'owner-only';
  };
  /** Enable/disable overage billing. */
  overage?: boolean;
  /** SSO configuration. */
  sso?: SsoConfig;
  /** SAML configuration. */
  saml?: SamlConfig;
}

/**
 * Parameters for transferring organization ownership.
 */
export type TransferOwnershipParams = {
  /** UUID of the member who will become the new owner. */
  newOwnerId: string;
}

/**
 * Response from creating an organization.
 */
export type CreateOrganizationResponse = {
  /** The created organization. */
  organization: Organization;
}

/**
 * Response from retrieving an organization.
 */
export type RetrieveOrganizationResponse = {
  /** The organization. */
  organization: Organization;
}

/**
 * User preferences.
 */
export type UserPreferences = {
  /** Language preference. */
  language?: 'en' | 'fr';
  /** UI theme preference. */
  theme?: 'auto' | 'dark' | 'light';
  /** Whether the onboarding tutorial has been completed. */
  tutorial?: boolean;
  /** Notification delivery preferences. */
  notifications?: {
    enabled?: boolean;
    types?: Array<'basic' | 'security' | 'usage' | 'budget' | 'invoice' | 'meeting'>;
  };
}

/**
 * A user account.
 */
export type User = {
  /** User ID who invited this user. */
  actor?: null | string;
  /** Unix timestamp (ms) when the user was created. */
  createdAt: number;
  /** User's email address. */
  email: string;
  /** Whether the user has OTP (2FA) configured. */
  hasOtp?: boolean;
  /** Unique identifier for the user. */
  id: string;
  /** Unix timestamp (ms) when the user joined the organization. */
  joinedAt?: null | number;
  /** Unix timestamp (ms) of the user's last login. */
  lastLoginAt?: null | number;
  /** Unix timestamp (ms) of the user's last token refresh. */
  lastRefreshAt?: null | number;
  /** User's display name. */
  name: string;
  /** Object type identifier. */
  object: 'user';
  /** Organization ID the user belongs to. */
  organization?: null | string;
  /** User preferences. */
  preferences?: UserPreferences;
  /** User permissions within the organization. */
  permissions: string[];
  /** Role IDs assigned to this user. */
  roles: string[];
  /** Unix timestamp (ms) when the user was last updated. */
  updatedAt?: number;
  /** Whether the user's email is verified. */
  verified: boolean;
}

/**
 * Parameters for creating a new user.
 */
export type CreateUserParams = {
  /** User's email address. */
  email: string;
  /** Invitation token required after the first user is bootstrapped. */
  invitation?: string;
  /** User's display name. */
  name: string;
}

/**
 * Parameters for updating a user.
 */
export type UpdateUserParams = {
  /** New email address. */
  email?: string;
  /** Usage limits. */
  limits?: {
    tokens?: { day?: number; hour?: number; month?: number };
  };
  /** New display name. */
  name?: string;
  /** Enable/disable overage billing for user. */
  overage?: boolean;
  /** User preferences. */
  preferences?: {
    language?: string;
    theme?: 'auto' | 'dark' | 'light';
    tutorial?: boolean;
    notifications?: {
      enabled?: boolean;
      types?: Array<'basic' | 'security' | 'usage' | 'budget' | 'invoice' | 'meeting'>;
    };
  };
  /** Email verification status. */
  verified?: boolean;
}

/**
 * Parameters for listing users.
 */
export type ListUsersParams = {
  /** Filter by role ID. */
  roleId?: string;
} & PaginationParams

/**
 * Response from listing users.
 */
export type ListUsersResponse = {
  /** Array of users. */
  items: User[];
  /** Whether there are more results. */
  more: boolean;
  /** Cursor for the next page. */
  next?: string;
  /** Total number of items. */
  total: number;
}

/**
 * Response from creating a user.
 */
export type CreateUserResponse = {
  /** QR Code URL for OTP enrollment. */
  qrCode: string;
  /** Recovery codes generated for the user. */
  recoveryCodes: string[];
  /** OTP secret for authenticator setup. */
  secret: string;
  /** Enrollment state returned after user creation. */
  status: 'setup_required';
  /** The created user. */
  user: User;
}

/**
 * Response from initiating OTP setup.
 */
export type OtpSetupResponse = {
  /** QR code data URL for authenticator app enrollment. */
  qrCode: string;
  /** OTP secret for manual entry. */
  secret: string;
}

/**
 * Parameters for confirming OTP setup.
 */
export type OtpConfirmParams = {
  /** The 6-digit OTP code from the authenticator app. */
  code: string;
  /** The OTP secret returned from setup. */
  secret: string;
}

/**
 * Response from confirming OTP setup.
 */
export type OtpConfirmResponse = {
  /** Recovery codes to store securely. */
  recoveryCodes: string[];
  /** Whether the operation succeeded. */
  success: true;
}

/**
 * Response from retrieving a user.
 */
export type RetrieveUserResponse = {
  /** The user. */
  user: User;
}

/**
 * Response containing user's permission scopes.
 */
export type UserScopesResponse = {
  /** Permission scopes granted to the user. */
  scopes: string[];
}

/**
 * Parameters for user login.
 */
export type LoginParams = {
  /** User's email address. */
  email: string;
  /** OTP code from authenticator app or recovery code. */
  code: string;
}

/**
 * Parameters for resolving the preferred login strategy for a user.
 */
export type LoginStrategyParams = {
  /** User's email address. */
  email: string;
}

/**
 * A redirect step that sends the user to an identity provider.
 */
export type LoginStrategyRedirectStep = {
  /** Authorization URL that redirects the user to the identity provider. */
  authorizationUrl?: string;
  /** Registered error code when the provider cannot produce an authorization URL. */
  error?: string;
  /** Organization the identity provider belongs to. */
  organizationId: string;
  /** Identity provider protocol. */
  provider: 'oidc' | 'saml';
  /** Step type discriminator. */
  type: 'redirect';
}

/**
 * A step that collects an OTP code from the user's authenticator app.
 */
export type LoginStrategyOtpStep = {
  /** Step type discriminator. */
  type: 'otp';
}

/**
 * A single authentication step the login UI should present.
 */
export type LoginStrategyStep = LoginStrategyRedirectStep | LoginStrategyOtpStep;

/**
 * Response from login strategy resolution.
 */
export type LoginStrategyResponse = {
  /** Ordered list of authentication steps the login UI should present. */
  steps: LoginStrategyStep[];
}

/**
 * Response from successful login.
 */
export type LoginResponse = {
  /** JWT access token for API requests. */
  accessToken?: string;
  /** Refresh token for obtaining new access tokens. */
  refreshToken?: string;
  /** The authenticated user. */
  user?: User;
  /** Status of 2FA setup requirement. */
  status?: 'setup_required';
  /** QR Code URL for 2FA setup. */
  qrCode?: string;
  /** Secret key for 2FA setup. */
  secret?: string;
  /** Recovery codes for 2FA. */
  recoveryCodes?: string[];
}

/**
 * Parameters for refreshing an access token.
 */
export type RefreshTokenParams = {
  /** The refresh token from login. */
  refreshToken: string;
}

/**
 * Response from token refresh.
 */
export type RefreshTokenResponse = {
  /** New JWT access token. */
  accessToken: string;
  /** New refresh token. */
  refreshToken?: string;
}

/**
 * Active login session metadata.
 */
export type AuthSession = {
  /** Source city if available from edge/proxy headers. */
  city?: string;
  /** Source country code if available from edge/proxy headers. */
  country?: string;
  /** Unix timestamp (ms) when this session was created. */
  createdAt: number;
  /** Unix timestamp (ms) when this refresh session expires. */
  expiresAt?: number;
  /** Unique session identifier. */
  id: string;
  /** Source IP address if available. */
  ip?: string;
  /** Session name. */
  name?: string;
  /** Store ID if session is store-related. */
  store?: string;
  /** Session size if relevant. */
  size?: number;
  /** Number of pages if relevant. */
  pages?: number | null;
  /** Last accessed timestamp if relevant. */
  lastAccessed?: number | null;
}

/**
 * Response from listing active sessions.
 */
export type ListSessionsResponse = {
  /** Active sessions for the authenticated user. */
  items: AuthSession[];
  /** Whether there are more results. */
  more: boolean;
  /** Cursor for the next page. */
  next?: string;
  /** Total number of items. */
  total: number;
}

/**
 * Parameters for email verification.
 */
export type VerifyEmailParams = {
  /** Email address to verify. */
  email: string;
  /** One-time password from verification email. */
  otp: string;
}

/**
 * Parameters for password reset.
 */
export type ResetPasswordParams = {
  /** New password (min 8 characters). */
  password: string;
}

/**
 * An OAuth App registered with the organization.
 */
export type App = {
  /** User ID who created the app. */
  actor: string;
  /** OAuth client ID. */
  clientId: string;
  /** OAuth client secret (only returned on create/regenerate). */
  clientSecret?: string;
  /** Unix timestamp (ms) when the app was created. */
  createdAt: number;
  /** Optional application description. */
  description?: string;
  /** Unique identifier for the app. */
  id: string;
  /** OAuth grant types enabled for this app. */
  grantTypes?: string[];
  /** Display name. */
  name: string;
  /** Object type identifier. */
  object: 'app';
  /** Organization ID this app belongs to. */
  organization: string;
  /** Allowed redirect URIs. */
  redirectUris: string[];
  /** OAuth scopes granted. */
  scopes?: string[];
  /** Unix timestamp (ms) when the app was last updated. */
  updatedAt?: number;
}

/**
 * Parameters for creating an OAuth App.
 */
export type CreateAppParams = {
  /** Display name. */
  name: string;
  /** Optional description. */
  description?: string;
  /** Allowed redirect URIs. */
  redirectUris?: string[];
  /** OAuth grant types. */
  grantTypes?: string[];
  /** OAuth scopes to grant. */
  scopes?: string[];
  /** Token endpoint auth method. */
  tokenEndpointAuthMethod?: 'client_secret_basic' | 'client_secret_post' | 'none';
  /** Whether consent screen is required. */
  requireConsent?: boolean;
  /** Whether PKCE is required. */
  requirePkce?: boolean;
}

/**
 * Response from creating an OAuth App (includes client secret).
 */
export type CreateAppResponse = {
  /** The created app. */
  app: App;
  /** OAuth client secret, returned only once. */
  clientSecret: string;
}

/**
 * Parameters for listing OAuth Apps.
 */
export type ListAppsParams = {
  /** Cursor for cursor-based pagination. */
  cursor?: string;
  /** Maximum number of items per page. */
  limit?: number;
  /** Sort order by creation date. */
  order?: 'asc' | 'desc';
  /** Number of items to skip. */
  skip?: number;
  /** Filter by application status. */
  status?: 'active' | 'revoked' | 'suspended';
}

/**
 * Response from listing OAuth Apps.
 */
export type ListAppsResponse = {
  /** Array of apps. */
  items: App[];
  /** Whether there are more results. */
  more: boolean;
  /** Cursor for the next page. */
  next?: string;
  /** Total number of items. */
  total: number;
}

/**
 * Response from retrieving an OAuth App.
 */
export type RetrieveAppResponse = {
  /** The app (without client secret). */
  app: App;
}

/**
 * Parameters for updating an OAuth App.
 */
export type UpdateAppParams = {
  /** New display name. */
  name?: string;
  /** Updated description. */
  description?: string;
  /** Updated redirect URIs. */
  redirectUris?: string[];
  /** Updated OAuth grant types. */
  grantTypes?: string[];
  /** Updated OAuth scopes. */
  scopes?: string[];
  /** Whether consent screen is required. */
  requireConsent?: boolean;
  /** Whether PKCE is required. */
  requirePkce?: boolean;
}

/**
 * Response from updating an OAuth App.
 */
export type UpdateAppResponse = {
  /** The updated app. */
  app: App;
}

/**
 * Response from regenerating an OAuth App secret.
 */
export type RegenerateAppSecretResponse = {
  /** OAuth client ID. */
  clientId: string;
  /** New OAuth client secret, returned only once. */
  clientSecret: string;
}

/**
 * Store-level permissions for a role.
 */
export type StoreGrant = {
  /** Store ID. */
  id: string;
  /** Scopes granted for this store. */
  scopes: ('files' | 'messages')[];
}

/**
 * Available permission scopes for roles.
 */
export type RoleScope =
  | 'analytics'
  | 'apps'
  | 'billing'
  | 'stores'
  | 'invitations'
  | 'logs'
  | 'members'
  | 'organization'
  | 'owner'
  | 'roles';

/**
 * A role defining user permissions.
 */
export type Role = {
  /** User ID who created the role. */
  actor: string;
  /** Per-store permissions. */
  stores?: StoreGrant[];
  /** Unix timestamp (ms) when the role was created. */
  createdAt: number;
  /** Unique identifier for the role. */
  id: string;
  /** Role name. */
  name: string;
  /** Object type identifier. */
  object: 'role';
  /** Organization ID this role belongs to. */
  organization: string;
  /** Global permission scopes. */
  scopes?: RoleScope[];
  /** Unix timestamp (ms) when the role was last updated. */
  updatedAt?: number;
}

/**
 * Parameters for creating a role.
 */
export type CreateRoleParams = {
  /** Per-store permissions. */
  stores?: StoreGrant[];
  /** Role name. */
  name: string;
  /** Global permission scopes. */
  scopes?: RoleScope[];
}

/**
 * Parameters for updating a role.
 */
export type UpdateRoleParams = {
  /** Updated per-store permissions. */
  stores?: StoreGrant[];
  /** New role name. */
  name?: string;
  /** Updated global scopes. */
  scopes?: RoleScope[];
}

/**
 * Parameters for listing roles.
 */
export type ListRolesParams = {
  /** Filter by user ID to get roles assigned to a user. */
  userId?: string;
} & PaginationParams

/**
 * Response from listing roles.
 */
export type ListRolesResponse = {
  /** Array of roles. */
  items: Role[];
  /** Whether there are more results. */
  more: boolean;
  /** Cursor for the next page. */
  next?: string;
  /** Total number of items. */
  total: number;
}

/**
 * Response from creating a role.
 */
export type CreateRoleResponse = {
  /** The created role. */
  role: Role;
}

/**
 * Response from retrieving a role.
 */
export type RetrieveRoleResponse = {
  /** The role. */
  role: Role;
}

/**
 * Usage tracking for an invitation.
 */
export type InvitationUsage = {
  /** User IDs who have used this invitation. */
  by: string[];
  /** Number of times the invitation has been used. */
  count: number;
  /** Maximum number of uses allowed. */
  max: number;
}

/**
 * An invitation to join an organization.
 */
export type Invitation = {
  /** User ID who created the invitation. */
  actor: string;
  /** Unix timestamp (ms) when the invitation was created. */
  createdAt: number;
  /** Email address the invitation is intended for. */
  email?: string;
  /** Unix timestamp (ms) when the invitation expires. */
  expiresAt?: null | number;
  /** Unique identifier for the invitation. */
  id: string;
  /** Object type identifier. */
  object: 'invitation';
  /** Organization ID this invitation belongs to. */
  organization: string;
  /** Role IDs assigned to users who accept this invitation. */
  roles: string[];
  /** Current status of the invitation. */
  status: 'accepted' | 'expired' | 'pending' | 'rejected';
  /** Unix timestamp (ms) when the invitation was last updated. */
  updatedAt?: number;
  /** Usage tracking. */
  usage: InvitationUsage;
}

/**
 * Parameters for creating an invitation.
 */
export type CreateInvitationParams = {
  /** Email address the invitation is intended for. */
  email?: string;
  /** Expiration time in seconds from now. */
  expiresIn?: number;
  /** Maximum number of uses. */
  maxUsage?: number;
  /** Role IDs to assign to users who accept this invitation. */
  roles: string[];
}

/**
 * Parameters for listing invitations.
 */
export type ListInvitationsParams = {
  /** Filter by creation date range. */
  date?: DateFilter;
  /** Filter by organization ID. */
  organizationId?: string;
  /** Filter by user ID who created the invitation. */
  userId?: string;
} & PaginationParams

/**
 * Response from listing invitations.
 */
export type ListInvitationsResponse = {
  /** Array of invitations. */
  items: Invitation[];
  /** Whether there are more results. */
  more: boolean;
  /** Cursor for the next page. */
  next?: string;
  /** Total number of items. */
  total: number;
}

/**
 * Response from creating an invitation.
 */
export type CreateInvitationResponse = {
  /** The created invitation. */
  invitation: Invitation;
}

/**
 * Response from retrieving an invitation.
 */
export type RetrieveInvitationResponse = {
  /** The invitation. */
  invitation: Invitation;
}

/**
 * Metadata associated with a log entry.
 */
export type LogMetadata = {
  /** Store ID involved in the action. */
  storeId?: string;
  /** Request duration in milliseconds. */
  duration?: number;
  /** Error code if the request failed. */
  errorCode?: string;
  /** File ID involved in the action. */
  fileId?: string;
  /** Folder ID involved in the action. */
  folderId?: string;
  /** Invitation ID involved in the action. */
  invitationId?: string;
  /** Message ID involved in the action. */
  messageId?: string;
  /** Organization ID involved in the action. */
  organizationId?: string;
  /** Role ID involved in the action. */
  roleId?: string;
  /** Thread ID involved in the action. */
  threadId?: string;
  /** User ID involved in the action. */
  userId?: string;
}

/**
 * An audit log entry.
 */
export type Log = {
  /** Actor ID (user or API key). */
  actor: string;
  /** Unix timestamp (ms) when the event occurred. */
  createdAt: number;
  /** Event type (e.g., 'user.login', 'file.upload'). */
  event: string;
  /** Unique identifier for the log entry. */
  id: string;
  /** Additional metadata about the event. */
  metadata?: LogMetadata;
  /** Object type identifier. */
  object: 'log';
  /** Organization ID. */
  organization: string;
  /** Severity level of the log event. */
  severity?: 'critical' | 'debug' | 'error' | 'info' | 'warn';
  /** Type of actor that triggered the event. */
  type: 'app' | 'system' | 'user';
}

/**
 * Parameters for listing logs.
 */
export type ListLogsParams = {
  /** Filter by date range. */
  date?: DateFilter;
  /** Filter by API key IDs. */
  apiKeyIds?: string[];
  /** Filter by user IDs. */
  userIds?: string[];
  /** Filter by store IDs. */
  storeIds?: string[];
  /** Filter by OAuth app client IDs. */
  appIds?: string[];
  /** Filter by roles. */
  roles?: string[];
} & PaginationParams

/**
 * Response from listing logs.
 */
export type ListLogsResponse = {
  /** Array of log entries. */
  items: Log[];
  /** Whether there are more results. */
  more: boolean;
  /** Cursor for the next page. */
  next?: string;
  /** Total number of items. */
  total: number;
}

/**
 * Response from retrieving a log entry.
 */
export type RetrieveLogResponse = {
  /** The log entry. */
  log: Log;
}

export type NotificationSeverity = 'error' | 'info' | 'success' | 'warning';

export type NotificationAction = {
  /** In-app route associated with the notification. */
  href?: string;
}

/**
 * An in-app notification for the authenticated user.
 */
export type Notification = {
  /** Optional route information for opening a related screen. */
  action?: NotificationAction;
  /** Code used by the client to render localized notification copy. */
  code: string;
  /** Unix timestamp (ms) when the notification was created. */
  createdAt: number;
  /** Unique notification identifier. */
  id: string;
  /** Interpolation metadata used by the client for display. */
  metadata?: Record<string, unknown>;
  /** Object type identifier. */
  object: 'notification';
  /** Organization ID. */
  organization: string;
  /** Unix timestamp (ms) when the notification was read. */
  readAt?: null | number;
  /** Visual severity of the notification. */
  severity: NotificationSeverity;
  /** User ID this notification targets. */
  user: string;
}

/**
 * Parameters for listing notifications.
 */
export type ListNotificationsParams = {
  /** When true, only unread notifications are returned. */
  unread?: boolean;
} & PaginationParams

/** Notification categories that can be enabled independently. */
export type NotificationCategory =
  | 'basic'
  | 'usage'
  | 'budget'
  | 'invoice'
  | 'security'
  | 'meeting';

/**
 * Response from listing notifications.
 */
export type ListNotificationsResponse = {
  /** Array of notifications. */
  items: Notification[];
  /** Whether there are more results. */
  more: boolean;
  /** Cursor for the next page. */
  next?: string;
  /** Total number of items. */
  total: number;
  /** Current unread notification count for the user. */
  unreadCount: number;
}

/**
 * Response from marking a notification as read.
 */
export type ReadNotificationResponse = {
  /** The updated notification. */
  notification: Notification;
  /** Current unread notification count for the user. */
  unreadCount: number;
}

/**
 * Response from marking all notifications as read.
 */
export type ReadAllNotificationsResponse = {
  /** Whether the operation succeeded. */
  success: boolean;
  /** Current unread notification count for the user. */
  unreadCount: number;
}

/**
 * Scope of a metric - identifies related resources.
 */
export type MetricScope = {
  /** API key ID(s) this metric is scoped to. */
  apiKey?: string | string[];
  /** OAuth app client ID(s) this metric is scoped to. */
  app?: string | string[];
  /** Store ID(s) this metric is scoped to. */
  store?: string | string[];
  /** File ID(s) this metric is scoped to. */
  file?: string | string[];
  /** Role(s) this metric is scoped to. */
  role?: string | string[];
  /** Thread ID(s) this metric is scoped to. */
  thread?: string | string[];
  /** User ID(s) this metric is scoped to. */
  user?: string | string[];
}

export type MetricFamily = 'knowledge' | 'performance' | 'system' | 'trust' | 'usage';

export type MetricKind = 'counter' | 'event' | 'gauge' | 'histogram';

export type MetricDimensions = {
  storeId?: string;
  roleId?: string;
  userId?: string;
}

export type MetricEntities = {
  fileId?: string;
  messageId?: string;
  pageId?: string;
  threadId?: string;
}

export type MetricSource = {
  model?: string;
  pipeline?: string;
  service: string;
  version?: string;
}

export type MetricTrace = {
  correlationId?: string;
  requestId?: string;
}

/**
 * A usage metric entry.
 */
export type Metric = {
  /** Flat attributes captured alongside the event. */
  attributes?: Record<string, boolean | number | string>;
  /** Unix timestamp (ms) when the metric was recorded. */
  createdAt: number;
  /** Dimension identifiers used to slice metrics. */
  dimensions?: MetricDimensions;
  /** Related business entities. */
  entities?: MetricEntities;
  /** Metric family. */
  family: MetricFamily;
  /** Unique identifier for the metric. */
  id: string;
  /** Metric kind. */
  kind: MetricKind;
  /** Canonical metric name (e.g., 'chat.tokens.used', 'knowledge.file.size'). */
  name: string;
  /** Object type identifier. */
  object: 'metric';
  /** Organization ID. */
  organization: string;
  /** Event source. */
  source?: MetricSource;
  /** Trace correlation fields. */
  trace?: MetricTrace;
  /** Unit of measurement (e.g., 'tokens', 'bytes', 'pages', 'count', 'ms'). */
  unit?: string;
  /** The measured numeric value. */
  value: number;
}

/**
 * Parameters for listing metrics.
 */
export type ListMetricsParams = {
  /** Filter by date range. */
  date?: DateFilter;
  /** Filter by metric name. */
  name?: string;
  /** Filter by scope (resources the metric is associated with). */
  scope?: MetricScope;
} & PaginationParams

/**
 * Response from listing metrics.
 */
export type ListMetricsResponse = {
  /** Whether there are more results available. */
  more: boolean;
  /** Maximum items returned per page. */
  limit: number;
  /** Array of metrics. */
  items: Metric[];
  /** Cursor for the next page. */
  next?: string;
  /** Total number of metrics matching the filter. */
  total: number;
}

/**
 * Response from retrieving a metric.
 */
export type RetrieveMetricResponse = {
  /** The metric. */
  metric: Metric;
}

/**
 * Aggregated metric summary per metric name.
 */
export type MetricSummaryItem = {
  /** Average value. */
  avg: number;
  /** Number of recorded events. */
  count: number;
  /** Metric name. */
  name: string;
  /** 50th percentile. */
  p50: number;
  /** 95th percentile. */
  p95: number;
  /** 99th percentile. */
  p99: number;
  /** Sum of all values. */
  total: number;
  /** Unit of measurement. */
  unit?: string;
}

/**
 * Daily trend bucket for a metric.
 */
export type MetricTrendBucket = {
  /** Date string (YYYY-MM-DD). */
  day: string;
  /** Metric name. */
  name: string;
  /** Aggregated value for the day. */
  value: number;
}

/**
 * Parameters for metric summary.
 */
export type MetricSummaryParams = {
  /** Filter by date range. */
  date?: DateFilter;
  /** Filter by scope. */
  scope?: MetricScope;
}

/**
 * Response from the metric summary endpoint.
 */
export type MetricSummaryResponse = {
  /** Per-metric aggregated summaries with percentiles. */
  summaries: MetricSummaryItem[];
  /** Daily trend buckets for all metrics. */
  trends: MetricTrendBucket[];
}

/**
 * Client telemetry error event.
 */
export type TelemetryErrorEvent = {
  code: string;
  route: string;
  source: string;
  type: 'error';
}

/**
 * Client telemetry navigation event.
 */
export type TelemetryNavigationEvent = {
  duration: number;
  from: string;
  to: string;
  type: 'navigation';
}

/**
 * Client telemetry page load event.
 */
export type TelemetryPageLoadEvent = {
  duration: number;
  route: string;
  type: 'page_load';
}

/**
 * Client telemetry Web Vital event.
 */
export type TelemetryWebVitalEvent = {
  name: string;
  route: string;
  type: 'web_vital';
  value: number;
}

/**
 * Supported client telemetry events.
 */
export type TelemetryEvent =
  | TelemetryErrorEvent
  | TelemetryNavigationEvent
  | TelemetryPageLoadEvent
  | TelemetryWebVitalEvent;

/**
 * Parameters for posting telemetry events.
 */
export type SendTelemetryParams = {
  events: TelemetryEvent[];
}

/**
 * Response from telemetry ingestion endpoint.
 */
export type SendTelemetryResponse = {
  accepted: number;
}

/**
 * Parameters for uploading text as a document.
 */
export type UploadTextParams = {
  /** Store IDs to add the document to. */
  storeIds: string[];
  /** Optional folder ID to place the document in. */
  folderId?: string;
  /** Optional metadata to attach. */
  metadata?: Record<string, unknown>;
  /** Name for the document. */
  name: string;
  /** Text content to upload. */
  text: string;
}

/**
 * Callback for automatic token refresh on 401 errors.
 * Should return a new access token or null if refresh fails.
 */
export type TokenRefreshCallback = () => Promise<null | string>;

/**
 * Configuration options for the Prosperify client.
 */
export type ProsperifyClientConfig = {
  /**
   * @default 'https://api.prosperify.app'
   */
  baseUrl?: string;
  /**
   * @default 3
   */
  maxRetries?: number;
  /**
   * Callback for automatic token refresh when 401 errors occur.
   * Called when the access token expires to obtain a new one.
   * Takes precedence over the built-in ``refreshToken`` mechanism.
   */
  onTokenRefresh?: TokenRefreshCallback;
  /**
   * JWT refresh token from login.  When provided (and no ``onTokenRefresh``
   * callback is set), the SDK will automatically call
   * ``POST /v1/auth/token/refresh`` on 401 errors and rotate both tokens.
   */
  refreshToken?: string;
  /**
   * @default true
   */
  retryOnNetworkError?: boolean;
  /**
   * @default true
   */
  retryOnServerError?: boolean;
  /**
   * @default 30000
   */
  timeout?: number;
  /**
   * JWT access token from login for client-side authentication.
   * Obtained via `auth.login()` or SSO callback.
   */
  token?: string;
  /**
   * OAuth client ID for client_credentials authentication.
   * Used together with clientSecret for server-to-server auth.
   */
  clientId?: string;
  /**
   * OAuth client secret for client_credentials authentication.
   */
  clientSecret?: string;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export type AnalyticsParams = {
  store?: string;
  date: {
    end: string;
    start: string;
  };
}

export type UsageMetrics = {
  'conversation.total': number;
  'feedback.dismissed.count': number;
  'feedback.reasons'?: Array<{ count: number; reason: FeedbackReason }>;
  'feedback.resolved.count': number;
  'feedback.total': number;
  'feedback.unresolved.count': number;
  'message.total': number;
  'usage.day': Array<{ count: number; day: number }>;
  'usage.hour': Array<{ count: number; hour: number }>;
  'user.active.total': number;
}

export type PerformanceMetrics = {
  'answer.total': number;
  'chunk.retrieved.total': number;
  'chunk.used.total': number;
  'citation.confidence.total': number;
  'citation.count.total': number;
  'document.accessed.total': number;
  'duration.generation.total': number;
  'duration.retrieval.total': number;
  'duration.total': number;
  'hallucination.count': number;
  'response.count': number;
}

export type AnalyticsUsageResponse = {
  metrics: UsageMetrics;
}

export type AnalyticsPerformanceResponse = {
  metrics: PerformanceMetrics;
}

export type InsightsTopDocument = {
  count: number;
  id: string;
  name: string;
}

export type InsightsTopUser = {
  count: number;
  id: string;
  name: string;
}

export type InsightsPeakCell = {
  count: number;
  day: number;
  hour: number;
}

export type NeverAccessedFile = {
  store: string;
  createdAt: number;
  id: string;
  name: string;
  pages: null | number;
  size: number;
  lastAccessed: number | null;
  uploadedBy?: string;
}

export type InsightsMetrics = {
  adoption: {
    activeUsers: number;
    rate: number;
    totalMembers: number;
  };
  'never.accessed.count': number;
  'never.accessed.files': NeverAccessedFile[];
  'top.documents': InsightsTopDocument[];
  'top.usage': InsightsPeakCell[];
  'top.users': InsightsTopUser[];
}

export type AnalyticsInsightsResponse = {
  metrics: InsightsMetrics;
}

export type MetricsOverviewSummary = {
  adoptionRate: number;
  avgResponseMs: number;
  avgCitationConfidence: number;
  activeUsers: number;
  hallucinationRate: number;
  requests: number;
  resolutionRate: number;
}

export type MetricsOverviewAdoption = {
  engagement: {
    peakUsage: InsightsPeakCell[];
    requestTrend: Array<{ timestamp: string; value: number }>;
    topUsers: InsightsTopUser[];
    usageByDay: Array<{ count: number; day: number }>;
    usageByHour: Array<{ count: number; hour: number }>;
  };
  summary: {
    activeUsers: number;
    adoptionRate: number;
    conversations: number;
    requestCount: number;
    totalMembers: number;
  };
}

export type MetricsOverviewTrust = {
  feedback: {
    dismissed: number;
    reasons: Array<{ count: number; reason: FeedbackReason }>;
    resolved: number;
    total: number;
    unresolved: number;
  };
  retrieval: {
    chunksRetrieved: number;
    chunksUsed: number;
    citationCount: number;
    documentsAccessed: number;
    hallucinationCount: number;
  };
  summary: {
    answerCount: number;
    avgCitationConfidence: number;
    chunkUtilizationRate: number;
    citationsPerAnswer: number;
    hallucinationRate: number;
    resolutionRate: number;
  };
}

export type MetricsOverviewPerformance = {
  latency: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  summary: {
    avgGenerationMs: number;
    avgOverheadMs: number;
    avgResponseMs: number;
    avgRetrievalMs: number;
    generatedAnswers: number;
    p95ResponseMs: number;
    totalTokens: number;
  };
  totals: {
    generationMs: number;
    responseMs: number;
    retrievalMs: number;
  };
}

export type MetricsOverviewKnowledge = {
  distribution: {
    p95FileSizeBytes: number;
    p95PageCount: number;
  };
  hygiene: {
    unusedDocumentCount: number;
    unusedDocuments: NeverAccessedFile[];
  };
  leaders: {
    topDocuments: InsightsTopDocument[];
  };
  summary: {
    filesUploaded: number;
    pagesProcessed: number;
    storageBytes: number;
    unusedDocumentCount: number;
  };
  trends: {
    pageVolume: Array<{ timestamp: string; value: number }>;
    uploads: Array<{ timestamp: string; value: number }>;
  };
}

export type MetricsOverviewMetrics = {
  adoption: MetricsOverviewAdoption;
  knowledge: MetricsOverviewKnowledge;
  overview: MetricsOverviewSummary;
  performance: MetricsOverviewPerformance;
  trust: MetricsOverviewTrust;
}

export type MetricsOverviewResponse = {
  metrics: MetricsOverviewMetrics;
}

// ---------------------------------------------------------------------------
// Message Feedback
// ---------------------------------------------------------------------------

export type FeedbackReason = 'inaccurate' | 'incomplete' | 'irrelevant' | 'outdated' | 'other';

export type SubmitFeedbackParams = {
  comment?: string;
  reason?: FeedbackReason;
  resolved: boolean | null;
}

export type MessageFeedback = {
  comment?: string;
  reason?: FeedbackReason;
  resolved: boolean | null;
  shown: boolean;
  submitted: number;
}

export type SubmitFeedbackResponse = {
  message: {
    feedback: MessageFeedback;
    id: string;
  };
}

/**
 * OAuth token endpoint response.
 */
export type OAuthTokenResponse = {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  scope?: string;
  tokenType: string;
}

/**
 * Parameters for OAuth authorize request.
 */
export type OAuthAuthorizeParams = {
  clientId: string;
  redirectUri: string;
  response_type: 'code';
  scope?: string;
  state?: string;
  code_challenge?: string;
  code_challenge_method?: 'S256' | 'plain';
}

/**
 * Parameters for OAuth token exchange.
 */
export type OAuthTokenParams = {
  clientId?: string;
  clientSecret?: string;
  code?: string;
  code_verifier?: string;
  device_code?: string;
  grant_type: 'authorization_code' | 'client_credentials' | 'device_code' | 'refresh_token';
  redirectUri?: string;
  refreshToken?: string;
  scope?: string;
}

/**
 * Response from OAuth authorize endpoint.
 */
export type OAuthAuthorizeResponse = {
  code: string;
  state?: string;
}

/**
 * Parameters for client credentials grant.
 */
export type ClientCredentialsParams = {
  clientId?: string;
  clientSecret?: string;
  scope?: string[];
}

/**
 * Parameters for the OAuth device code flow initiation.
 */
export type OAuthDeviceCodeParams = {
  clientId?: string;
  clientSecret?: string;
  scope?: string;
}

/**
 * Response from the OAuth device code flow initiation.
 */
export type OAuthDeviceCodeResponse = {
  deviceCode: string;
  expiresIn: number;
  interval: number;
  userCode: string;
  verificationUri: string;
  verificationUriComplete?: string;
}
