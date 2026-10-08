"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  AcademicCapIcon, ArrowLeftIcon, ArrowPathIcon, ArrowRightIcon, ArrowRightOnRectangleIcon,
  Bars3Icon, BellIcon, CalendarDaysIcon, CheckCircleIcon, CheckIcon,
  ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardDocumentListIcon,
  ClockIcon, Cog6ToothIcon, DocumentTextIcon, ExclamationCircleIcon,
  FunnelIcon, InformationCircleIcon, MagnifyingGlassIcon, MapPinIcon,
  PaperClipIcon, PencilSquareIcon, PlusIcon, ShieldCheckIcon, Squares2X2Icon,
  TrashIcon, UserCircleIcon, UserGroupIcon, XMarkIcon
} from "@heroicons/react/24/outline";
import { useDemo } from "@/components/demo-provider";
import {
  badgeTone, createMockRequests, displayDate, EIU_ASSETS, MOCK_EMAIL,
  MOCK_USER, statusLabel, todayIso, type Locale, type MeetingRequest, type Role,
  type Status
} from "@/lib/demo-data";

const COPY = {
  vi: {
    demo:"BẢN XEM TRƯỚC · DEMO",app:"UniCouncil Scheduler", university:"ĐẠI HỌC QUỐC TẾ MIỀN ĐÔNG",
    tagline:"Một không gian thống nhất để đăng ký, phối hợp và phê duyệt lịch họp lãnh đạo.",
    loginTitle:"Kết nối những cuộc họp giá trị.", loginIntro:"Quy trình rõ ràng. Lịch trình chủ động. Hợp tác hiệu quả.",
    signIn:"Tiếp tục với tài khoản EIU",loginNote:"Bản thử nghiệm giao diện. Không kết nối Google Workspace hoặc gửi dữ liệu thật.",
    enterDemo:"Vào giao diện demo",user:"Tài khoản minh họa",workspace:"KHÔNG GIAN LÀM VIỆC",nav:"ĐIỀU HƯỚNG",
    REQUESTER:"Người đăng ký",ASSISTANT:"Trợ lý lãnh đạo",LEADER:"Lãnh đạo",ADMIN:"Quản trị",
    myRequests:"Yêu cầu của tôi",workQueue:"Xử lý yêu cầu",leaderQueue:"Phê duyệt yêu cầu",newRequest:"Tạo yêu cầu",
    calendar:"Lịch họp",settings:"Quản trị",preview:"Giao diện thử nghiệm",previewSub:"Dữ liệu minh họa, chưa kết nối hệ thống thật",
    search:"Tìm mã, nội dung, người đăng ký...",allStatuses:"Tất cả trạng thái",
    all:"Tất cả",today:"Hôm nay",tomorrow:"Ngày mai",week:"Tuần này",month:"Tháng này",
    reset:"Đặt lại",filters:"Bộ lọc",overview:"TỔNG QUAN",allRequests:"Tổng yêu cầu",
    waiting:"Cần quan tâm",approved:"Đã duyệt",requestList:"Danh sách yêu cầu",
    requester:"Người đăng ký",agenda:"Nội dung cuộc họp",unit:"Đơn vị",date:"Ngày dự kiến",status:"Trạng thái",
    latest:"Cập nhật",actions:"Thao tác",empty:"Không tìm thấy yêu cầu phù hợp",emptyDesc:"Hãy thử thay đổi từ khóa hoặc bộ lọc.",
    detail:"Chi tiết yêu cầu",meetingInfo:"THÔNG TIN CUỘC HỌP",participants:"Thành phần tham dự đề xuất",
    preferred:"Ngày họp mong muốn",official:"Lịch họp chính thức",noOfficial:"Chưa được xếp lịch chính thức",
    documents:"TÀI LIỆU ĐÍNH KÈM",noDocuments:"Chưa có tài liệu đính kèm",history:"TIẾN TRÌNH XỬ LÝ",
    created:"Yêu cầu được tạo",current:"Trạng thái hiện tại",close:"Đóng",leader:"Lãnh đạo",room:"Địa điểm",
    submitLeader:"Trình lãnh đạo",approve:"Duyệt yêu cầu",requestRevision:"Yêu cầu chỉnh sửa",
    sendBack:"Gửi người đăng ký bổ sung",revisionInstruction:"Nội dung cần chỉnh sửa",leaderComment:"Góp ý của lãnh đạo (không bắt buộc)",
    send:"Xác nhận",cancel:"Hủy",edit:"Chỉnh sửa và gửi lại",required:"Vui lòng nhập nội dung cần chỉnh sửa.",
    successDemo:"Đã cập nhật dữ liệu minh họa. Đây không phải thao tác thật.",demoAction:"Thao tác demo",
    formTitle:"Đăng ký lịch họp",formSub:"Điền thông tin đề xuất. Trợ lý lãnh đạo sẽ phối hợp hoàn thiện lịch chính thức.",
    section1:"Thông tin người đề xuất",section2:"Nội dung cuộc họp",section3:"Tài liệu liên quan",
    fullName:"Họ và tên",email:"Email trường",schoolUnit:"Trường / Phòng / Đơn vị",
    agendaField:"Nội dung cuộc họp đề xuất",participantsField:"Thành phần tham dự đề xuất",
    preferredDate:"Ngày họp mong muốn",noTime:"Ngày chính thức có thể khác ngày đề xuất.",
    attach:"Chọn tài liệu đính kèm",attachNote:"PDF, Word, Excel, PowerPoint hoặc ảnh · tối đa 10 tệp, 4 MB/tệp",
    uploaded:"Sẵn sàng gửi",fileError:"Không hợp lệ",remove:"Xóa",retry:"Thử lại",
    submit:"Gửi yêu cầu",resubmit:"Gửi lại yêu cầu",confirmDemo:"Gửi thử (không lưu vào Google Sheets)",
    unitHelp:"Chọn một hoặc nhiều đơn vị",formError:"Vui lòng điền đầy đủ những trường bắt buộc.",
    exceeds:"Tệp vượt quá 4 MB",unsupported:"Định dạng không hỗ trợ",maxFiles:"Chỉ được chọn tối đa 10 tệp",
    infoNote:"Thông tin đăng nhập được lấy tự động từ tài khoản của trường khi triển khai thật.",
    formSaved:"Đã gửi yêu cầu thử nghiệm · dữ liệu chỉ tồn tại trong phiên xem trước.",
    calendarTitle:"Lịch họp lãnh đạo",calendarSub:"Theo dõi lịch các cuộc họp đã được phê duyệt.",
    scheduled:"Đã xếp lịch",viewMonth:"Tháng",upcoming:"SẮP DIỄN RA",noneScheduled:"Chưa có lịch họp được duyệt trong ngày.",
    adminTitle:"Không gian quản trị",adminSub:"Xem trước cấu trúc quản lý danh mục và nhân sự.",
    staff:"Nhân sự & quyền",catalogs:"Danh mục hệ thống",logs:"Nhật ký thay đổi",
    adminNote:"Các màn hình quản trị chuyên sâu sẽ được triển khai sau khi duyệt giao diện.",
    signOut:"Về trang đăng nhập",mock:"Chỉ là dữ liệu mẫu",statusAll:"Tất cả",
    choose:"Chọn...",searchClear:"Xóa tìm kiếm",noMeetingToday:"Không có lịch họp trong ngày này",
    pageDescription:"Quản lý vòng đời yêu cầu họp với lãnh đạo trường tại một nơi.",
    assistantSub:"Tiếp nhận, rà soát và chuẩn bị hồ sơ trình lãnh đạo.",
    leaderSub:"Xem xét các đề xuất được trình và phản hồi nhanh chóng.",
    ownSub:"Theo dõi và cập nhật các yêu cầu họp của bạn.",
    timelineTip:"Lịch sử đầy đủ sẽ được lấy từ AuditLog khi tích hợp backend.",
    language:"Ngôn ngữ",policy:"Không có Save Draft. Tệp chưa gửi không được lưu lâu dài.",
    return:"Quay lại",legend:"Lịch đã duyệt",revisionHint:"Nội dung cần điều chỉnh theo yêu cầu của Trợ lý"
  },
  en: {
    demo:"INTERACTIVE UI PREVIEW · DEMO",app:"UniCouncil Scheduler",university:"EASTERN INTERNATIONAL UNIVERSITY",
    tagline:"A unified place to request, coordinate and approve leadership meetings.",
    loginTitle:"Where meaningful meetings begin.",loginIntro:"Clear workflows. Confident schedules. Better collaboration.",
    signIn:"Continue with an EIU account",loginNote:"UI-only preview. No live Google Workspace authentication or data submission.",
    enterDemo:"Explore the demo",user:"Demo account",workspace:"YOUR WORKSPACE",nav:"NAVIGATION",
    REQUESTER:"Requester",ASSISTANT:"Executive Assistant",LEADER:"Leader",ADMIN:"Administrator",
    myRequests:"My requests",workQueue:"Process requests",leaderQueue:"Review requests",newRequest:"New request",
    calendar:"Meeting calendar",settings:"Administration",preview:"Interface preview",previewSub:"Illustrative data, not connected to production",
    search:"Search reference, agenda, requester...",allStatuses:"All statuses",
    all:"All",today:"Today",tomorrow:"Tomorrow",week:"This week",month:"This month",
    reset:"Reset",filters:"Filters",overview:"OVERVIEW",allRequests:"All requests",
    waiting:"Needs attention",approved:"Approved",requestList:"Meeting requests",
    requester:"Requester",agenda:"Meeting agenda",unit:"Unit",date:"Preferred date",status:"Status",
    latest:"Updated",actions:"Actions",empty:"No matching requests",emptyDesc:"Try another search term or remove filters.",
    detail:"Request details",meetingInfo:"MEETING INFORMATION",participants:"Proposed participants",
    preferred:"Preferred meeting date",official:"Official meeting schedule",noOfficial:"Not officially scheduled yet",
    documents:"ATTACHMENTS",noDocuments:"No documents attached",history:"ACTIVITY TIMELINE",
    created:"Request created",current:"Current status",close:"Close",leader:"Leader",room:"Location",
    submitLeader:"Submit to Leader",approve:"Approve request",requestRevision:"Request revision",
    sendBack:"Return to Requester",revisionInstruction:"Revision instructions",leaderComment:"Leader comments (optional)",
    send:"Confirm",cancel:"Cancel",edit:"Edit and resubmit",required:"Please provide revision instructions.",
    successDemo:"Demo state updated. No real operation was performed.",demoAction:"Demo action",
    formTitle:"Propose a meeting",formSub:"Enter your preferred details. The Assistant will coordinate the official schedule.",
    section1:"Requester details",section2:"Meeting proposal",section3:"Supporting documents",
    fullName:"Full name",email:"School email",schoolUnit:"School / Office / Unit",
    agendaField:"Proposed meeting agenda",participantsField:"Proposed meeting participants",
    preferredDate:"Preferred meeting date",noTime:"The official meeting date may differ from your preference.",
    attach:"Choose attachments",attachNote:"PDF, Office documents or images · up to 10 files, 4 MB each",
    uploaded:"Ready",fileError:"Invalid",remove:"Remove",retry:"Retry",
    submit:"Submit request",resubmit:"Resubmit request",confirmDemo:"Demo submit (does not write to Google Sheets)",
    unitHelp:"Select one or multiple units",formError:"Please complete all required fields.",
    exceeds:"File exceeds 4 MB",unsupported:"Unsupported file format",maxFiles:"Maximum 10 files allowed",
    infoNote:"Identity will be filled automatically from the EIU account in the production version.",
    formSaved:"Demo request submitted · data is only available in this preview session.",
    calendarTitle:"Leadership calendar",calendarSub:"Review scheduled meetings that have been approved.",
    scheduled:"Scheduled",viewMonth:"Month",upcoming:"COMING UP",noneScheduled:"No approved meetings on this date.",
    adminTitle:"Administration workspace",adminSub:"Preview staff and system catalog management.",
    staff:"Staff & roles",catalogs:"System catalogs",logs:"Audit history",
    adminNote:"Advanced administration screens follow after visual approval.",
    signOut:"Back to login",mock:"Sample records only",statusAll:"All",
    choose:"Select...",searchClear:"Clear search",noMeetingToday:"No meetings scheduled for this date",
    pageDescription:"Manage leadership meeting requests from submission to decision.",
    assistantSub:"Review incoming proposals and prepare requests for approval.",
    leaderSub:"Review submitted requests and make decisions with confidence.",
    ownSub:"Track and update your meeting proposals in one place.",
    timelineTip:"The complete timeline will come from AuditLog after backend integration.",
    language:"Language",policy:"No Save Draft. Unsubmitted files are not stored permanently.",
    return:"Back",legend:"Approved meetings",revisionHint:"Changes requested by the Assistant"
  }
} as const;
type TextKey = keyof typeof COPY.vi;
function t(locale:Locale,key:TextKey):string{return COPY[locale][key];}
const ROLES: Role[]=["REQUESTER","ASSISTANT","LEADER","ADMIN"];
const UNITS=["Phòng Hành chính – Tổng hợp","Phòng Đào tạo","Phòng Hợp tác quốc tế","Khoa Công nghệ thông tin","Khoa Kỹ thuật","Phòng Công tác Sinh viên"];
function friendlyDate(value:string,locale:Locale){return displayDate(value,locale);}
function dateOffset(offset:number){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}

function StatusBadge({status,role,locale}:{status:Status;role:Role;locale:Locale}) {
  return <span className={"status-badge tone-"+badgeTone(status,role)}><span className="badge-dot" />{statusLabel(status,role,locale)}</span>;
}
function DemoNotice({locale}:{locale:Locale}) {
  return <span className="demo-flag"><span className="blink-dot"/>{t(locale,"demo")}</span>;
}
function SectionEyebrow({children}:{children:React.ReactNode}){
  return <span className="eyebrow">{children}</span>;
}
function Logo({corner=false}:{corner?:boolean}) {
  return <Image className={corner?"corner-logo":"eiu-full-logo"} src={corner?EIU_ASSETS.cornerLogo:EIU_ASSETS.fullLogo} width={corner?188:300} height={corner?188:92} alt="Eastern International University" unoptimized />;
}

function SignIn({locale,onLocaleChange,enter}:{locale:Locale;onLocaleChange:(v:Locale)=>void;enter:()=>void}){
  return <div className="signin-layout">
    <div className="signin-brand">
      <div className="signin-corner"><Logo corner /></div>
      <div className="signin-grid" aria-hidden="true"/>
      <div className="signin-brand-content">
        <span className="signin-kicker">EIU · UNICOUNCIL</span>
        <h1>{t(locale,"loginTitle")}</h1>
        <p>{t(locale,"loginIntro")}</p>
        <div className="signin-art" aria-hidden="true"><div className="art-orbit art-orbit-one"/><div className="art-orbit art-orbit-two"/><div className="art-center"><CalendarDaysIcon/></div></div>
      </div>
      <p className="signin-footer">© Eastern International University · UniCouncil</p>
    </div>
    <div className="signin-entry">
      <div className="signin-lang"><LanguageSwitch locale={locale} change={onLocaleChange}/></div>
      <div className="signin-card">
        <div className="login-brand-mini">EASTERN INTERNATIONAL UNIVERSITY</div>
        <span className="login-icon"><AcademicCapIcon/></span>
        <SectionEyebrow>{t(locale,"demo")}</SectionEyebrow>
        <h2>{t(locale,"app")}</h2>
        <p>{t(locale,"tagline")}</p>
        <button type="button" onClick={enter} className="button button-primary button-full">
          <span>{t(locale,"enterDemo")}</span><ArrowRightIcon className="icon-sm"/>
        </button>
        <div className="login-hr"><span>{t(locale,"demoAction")}</span></div>
        <button type="button" className="button button-outline button-full" onClick={enter}>
          <span className="google-g">G</span>{t(locale,"signIn")}
        </button>
        <div className="signin-disclaimer"><InformationCircleIcon/>{t(locale,"loginNote")}</div>
      </div>
      <p className="login-bottom">DESIGNED FOR EIU · 2026</p>
    </div>
  </div>;
}
function LanguageSwitch({locale,change}:{locale:Locale;change:(v:Locale)=>void}){
  return <div className="language-switch" role="group" aria-label="Language / Ngôn ngữ">
    <button type="button" className={locale==="vi"?"language-active":""} onClick={()=>change("vi")} aria-pressed={locale==="vi"}>VI</button>
    <span className="language-rule"/>
    <button type="button" className={locale==="en"?"language-active":""} onClick={()=>change("en")} aria-pressed={locale==="en"}>EN</button>
  </div>;
}

type ActionKind="approve"|"leaderRevision"|"delegate"|"submitLeader";
function DetailDrawer({request,role,locale,onClose,onAction,onEdit}:{request:MeetingRequest;role:Role;locale:Locale;onClose:()=>void;onAction:(kind:ActionKind,request:MeetingRequest)=>void;onEdit:(request:MeetingRequest)=>void;}){
  const allowEdit=role==="REQUESTER" && request.requester===MOCK_USER && (request.status==="ADJUSTED"||request.status==="REVISED")&&request.revisionTarget==="REQUESTER";
  return <div className="drawer-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <aside role="dialog" aria-modal="true" aria-label={t(locale,"detail")} className="detail-drawer">
      <div className="drawer-head"><span className="drawer-heading">{t(locale,"detail")}</span><button type="button" className="icon-button" onClick={onClose} aria-label={t(locale,"close")}><XMarkIcon/></button></div>
      <div className="drawer-scroll">
        <span className="ref">{request.id}</span>
        <h2 className="drawer-title">{request.agenda}</h2>
        <StatusBadge status={request.status} role={role} locale={locale}/>
        {allowEdit&&request.instruction&&<div className="revision-banner"><ExclamationCircleIcon/><div><strong>{t(locale,"revisionHint")}</strong><p>{request.instruction}</p></div></div>}
        <div className="detail-section"><SectionEyebrow>{t(locale,"meetingInfo")}</SectionEyebrow>
          <div className="detail-field"><span>{t(locale,"requester")}</span><strong>{request.requester}</strong></div>
          <div className="detail-field"><span>{t(locale,"unit")}</span><strong>{request.unit}</strong></div>
          <div className="detail-field"><span>{t(locale,"participants")}</span><strong>{request.participants}</strong></div>
          <div className="detail-field"><span>{t(locale,"preferred")}</span><strong>{friendlyDate(request.preferredDate,locale)}</strong></div>
          <div className="detail-field"><span>{t(locale,"official")}</span><strong>{request.meetingDate?friendlyDate(request.meetingDate,locale)+" · "+(request.meetingTime||""):t(locale,"noOfficial")}</strong></div>
          {request.location&&<div className="detail-field"><span>{t(locale,"room")}</span><strong>{request.location}</strong></div>}
        </div>
        <div className="detail-section"><SectionEyebrow>{t(locale,"documents")}</SectionEyebrow>
          {request.documents.length?request.documents.map(doc=><div className="document-line" key={doc}><span className="document-icon"><DocumentTextIcon/></span><div><strong>{doc}</strong><small>Google Drive · Demo</small></div><PaperClipIcon className="icon-sm"/></div>):<div className="soft-empty">{t(locale,"noDocuments")}</div>}
        </div>
        <div className="detail-section"><SectionEyebrow>{t(locale,"history")}</SectionEyebrow>
          <div className="timeline"><div className="timeline-point"><span className="timeline-bullet"/><div><strong>{t(locale,"current")}</strong><small>{statusLabel(request.status,role,locale)} · {request.updated}</small></div></div><div className="timeline-point"><span className="timeline-bullet timeline-muted"/><div><strong>{t(locale,"created")}</strong><small>{t(locale,"timelineTip")}</small></div></div></div>
        </div>
      </div>
      <div className="drawer-actions">
        {allowEdit&&<button className="button button-primary button-full" type="button" onClick={()=>onEdit(request)}><PencilSquareIcon className="icon-sm"/>{t(locale,"edit")}</button>}
        {role==="LEADER"&&request.status==="PENDING_APPROVAL"&&<div className="action-duo"><button type="button" className="button button-outline" onClick={()=>onAction("leaderRevision",request)}>{t(locale,"requestRevision")}</button><button type="button" className="button button-primary" onClick={()=>onAction("approve",request)}><CheckIcon className="icon-sm"/>{t(locale,"approve")}</button></div>}
        {role==="ASSISTANT"&&(request.status==="PROCESSING"||request.status==="REVISED"||request.status==="REVISED_PROCESSING")&&<div className="action-duo"><button type="button" className="button button-outline" onClick={()=>onAction("delegate",request)}>{t(locale,"sendBack")}</button><button type="button" className="button button-primary" onClick={()=>onAction("submitLeader",request)}>{t(locale,"submitLeader")}<ArrowRightIcon className="icon-sm"/></button></div>}
        <div className="demo-footnote">{t(locale,"mock")}</div>
      </div>
    </aside>
  </div>;
}
function ActionModal({kind,request,locale,close,confirm}:{kind:ActionKind;request:MeetingRequest;locale:Locale;close:()=>void;confirm:(note:string)=>void;}){
 const [note,setNote]=useState("");
 const [error,setError]=useState(false);
 const required=kind==="delegate";
 const heading=kind==="approve"?t(locale,"approve"):kind==="leaderRevision"?t(locale,"requestRevision"):kind==="delegate"?t(locale,"sendBack"):t(locale,"submitLeader");
 return <div className="modal-backdrop" onMouseDown={e=>{if(e.currentTarget===e.target)close();}}>
  <div className="action-modal" role="dialog" aria-modal="true" aria-label={heading}>
   <div className="modal-head"><div><SectionEyebrow>{t(locale,"demoAction")}</SectionEyebrow><h2>{heading}</h2></div><button type="button" className="icon-button" aria-label={t(locale,"close")} onClick={close}><XMarkIcon/></button></div>
   <p className="modal-sub">{request.id} · {request.agenda}</p>
   {(kind==="delegate"||kind==="leaderRevision")&&<label className="field-label">{kind==="delegate"?t(locale,"revisionInstruction"):t(locale,"leaderComment")} {required&&<span className="required-star">*</span>}
    <textarea value={note} onChange={e=>{setNote(e.target.value);setError(false);}} rows={4} placeholder={kind==="leaderRevision"?t(locale,"leaderComment"):t(locale,"revisionInstruction")} />
    {error&&<span className="inline-error">{t(locale,"required")}</span>}
   </label>}
   <p className="modal-note"><InformationCircleIcon/>{t(locale,"loginNote")}</p>
   <div className="modal-buttons"><button type="button" className="button button-outline" onClick={close}>{t(locale,"cancel")}</button><button type="button" className="button button-primary" onClick={()=>{if(required&&!note.trim()){setError(true);return;}confirm(note.trim());}}>{t(locale,"send")}</button></div>
  </div>
 </div>;
}

function RequestsView({role,locale,requests,open,newRequest}:{role:Role;locale:Locale;requests:MeetingRequest[];open:(request:MeetingRequest)=>void;newRequest:()=>void}){
 const [query,setQuery]=useState("");
 const [status,setStatus]=useState("all");
 const [dateFilter,setDateFilter]=useState("all");
 const [page,setPage]=useState(1);
 const list=useMemo(()=>{
  return requests.filter(x=>{
    if(role==="REQUESTER"&&x.requester!==MOCK_USER) return false;
    if(role==="LEADER"&&!["PENDING_APPROVAL","REVISED","REVISED_PROCESSING","APPROVED","COMPLETED"].includes(x.status)) return false;
    return true;
  });
 },[requests,role]);
 const searched=list.filter(x=>{
  if(query&&!((x.agenda+" "+x.id+" "+x.requester+" "+x.unit).toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))))return false;
  if(status!=="all"){
   if(status==="processing"&&!["PROCESSING","PENDING_APPROVAL","REVISED_PROCESSING"].includes(x.status))return false;
   if(status==="revision"&&!["ADJUSTED","REVISED"].includes(x.status))return false;
   if(status!=="processing"&&status!=="revision"&&x.status!==status)return false;
  }
  if(dateFilter!=="all"){
   const today=todayIso(),tomorrow=dateOffset(1);
   if(dateFilter==="today"&&x.preferredDate!==today)return false;
   if(dateFilter==="tomorrow"&&x.preferredDate!==tomorrow)return false;
   if(dateFilter==="week"){const diff=Math.floor((new Date(x.preferredDate+"T12:00:00").getTime()-new Date(today+"T12:00:00").getTime())/86400000);if(diff<0||diff>6)return false;}
   if(dateFilter==="month"&&x.preferredDate.slice(0,7)!==today.slice(0,7))return false;
  }
  return true;
 });
 const shown=searched.slice((page-1)*6,page*6);
 const counts={total:list.length,waiting:list.filter(r=>["PROCESSING","PENDING_APPROVAL","ADJUSTED","REVISED","REVISED_PROCESSING"].includes(r.status)).length,approved:list.filter(r=>r.status==="APPROVED").length};
 const title=role==="REQUESTER"?t(locale,"myRequests"):role==="ASSISTANT"?t(locale,"workQueue"):role==="LEADER"?t(locale,"leaderQueue"):t(locale,"requestList");
 const subtitle=role==="REQUESTER"?t(locale,"ownSub"):role==="ASSISTANT"?t(locale,"assistantSub"):role==="LEADER"?t(locale,"leaderSub"):t(locale,"pageDescription");
 const statuses=role==="REQUESTER"?[["all",t(locale,"allStatuses")],["processing",t(locale,"vi" as TextKey)||""],["revision",locale==="vi"?"Điều chỉnh":"Revision needed"],["APPROVED",t(locale,"approved")],["COMPLETED",statusLabel("COMPLETED",role,locale)],["CANCELLED",statusLabel("CANCELLED",role,locale)]]:[[ "all",t(locale,"allStatuses")],...(["PROCESSING","PENDING_APPROVAL","ADJUSTED","REVISED","REVISED_PROCESSING","APPROVED","CANCELLED","COMPLETED"] as Status[]).map(s=>[s,statusLabel(s,role,locale)])];
 // Fix requester-specific group text without exposing the technical status.
 if(role==="REQUESTER") statuses[1][1]=locale==="vi"?"Đang xử lý":"Processing";
 return <div className="page-shell">
   <div className="page-title-row"><div><SectionEyebrow>{t(locale,"overview")}</SectionEyebrow><h1 className="page-title">{title}</h1><p className="page-subtitle">{subtitle}</p></div>{role==="REQUESTER"&&<button type="button" className="button button-primary create-button" onClick={newRequest}><PlusIcon className="icon-sm"/>{t(locale,"newRequest")}</button>}</div>
   <div className="stats-row">
    <div className="stat-card"><div className="stat-label"><span>{t(locale,"allRequests")}</span><ClipboardDocumentListIcon/></div><strong>{counts.total.toString().padStart(2,"0")}</strong><small>{t(locale,"mock")}</small></div>
    <div className="stat-card"><div className="stat-label"><span>{t(locale,"waiting")}</span><ClockIcon/></div><strong>{counts.waiting.toString().padStart(2,"0")}</strong><small>{t(locale,"requestList")}</small></div>
    <div className="stat-card"><div className="stat-label"><span>{t(locale,"approved")}</span><CheckCircleIcon/></div><strong>{counts.approved.toString().padStart(2,"0")}</strong><small>{t(locale,"calendar")}</small></div>
   </div>
   <div className="list-card">
    <div className="table-card-heading"><div><h2>{t(locale,"requestList")}</h2><p>{t(locale,"pageDescription")}</p></div><span className="result-counter">{searched.length} {locale==="vi"?"yêu cầu":"requests"}</span></div>
    <div className="filter-area">
      <div className="filter-row"><div className="search-shell"><MagnifyingGlassIcon/><input type="search" value={query} placeholder={t(locale,"search")} onChange={e=>{setQuery(e.target.value);setPage(1);}} aria-label={t(locale,"search")}/></div><div className="select-shell"><FunnelIcon/><select value={status} aria-label={t(locale,"status")} onChange={e=>{setStatus(e.target.value);setPage(1);}}>{statuses.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><ChevronDownIcon/></div></div>
      <div className="preset-row">{([["all","all"],["today","today"],["tomorrow","tomorrow"],["week","week"],["month","month"]] as const).map(([value,key])=><button key={value} type="button" onClick={()=>{setDateFilter(value);setPage(1);}} className={"preset "+(dateFilter===value?"preset-active":"")}>{t(locale,key)}</button>)}{(status!=="all"||query||dateFilter!=="all")&&<button type="button" className="clear-filters" onClick={()=>{setQuery("");setDateFilter("all");setStatus("all");setPage(1);}}><ArrowPathIcon/>{t(locale,"reset")}</button>}</div>
    </div>
    {shown.length?<>
      <div className="table-scroll"><table className="requests-table"><thead><tr><th>{locale==="vi"?"Mã yêu cầu":"Reference"}</th><th>{t(locale,"agenda")}</th><th>{t(locale,"requester")}</th><th>{t(locale,"date")}</th><th>{t(locale,"status")}</th><th><span className="visually-hidden">{t(locale,"actions")}</span></th></tr></thead><tbody>{shown.map(r=><tr key={r.id} tabIndex={0} onClick={()=>open(r)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open(r);}}} aria-label={r.id+" "+r.agenda}><td><span className="table-ref">{r.id}</span></td><td><strong className="agenda-text">{r.agenda}</strong><small className="agenda-unit">{r.unit}</small></td><td>{r.requester}</td><td>{friendlyDate(r.preferredDate,locale)}</td><td><StatusBadge status={r.status} role={role} locale={locale}/></td><td><ChevronRightIcon className="table-chevron"/></td></tr>)}</tbody></table></div>
      <div className="mobile-request-cards">{shown.map(r=><button type="button" className="request-mobile-card" key={r.id} onClick={()=>open(r)}><div className="mobile-card-top"><span className="table-ref">{r.id}</span><StatusBadge status={r.status} role={role} locale={locale}/></div><strong>{r.agenda}</strong><div className="mobile-meta"><CalendarDaysIcon/>{friendlyDate(r.preferredDate,locale)}<span>·</span>{r.unit}</div><div className="mobile-card-bottom"><span>{r.requester}</span><ArrowRightIcon/></div></button>)}</div>
      <div className="table-footer"><span>{(page-1)*6+1}–{Math.min(page*6,searched.length)} / {searched.length}</span><div><button className="icon-button pagination" type="button" disabled={page===1} onClick={()=>setPage(p=>p-1)} aria-label="Previous"><ChevronLeftIcon/></button><button className="icon-button pagination" type="button" disabled={page*6>=searched.length} onClick={()=>setPage(p=>p+1)} aria-label="Next"><ChevronRightIcon/></button></div></div>
    </>:<div className="empty-list"><div className="empty-visual"><MagnifyingGlassIcon/></div><h3>{t(locale,"empty")}</h3><p>{t(locale,"emptyDesc")}</p><button type="button" className="button button-outline" onClick={()=>{setQuery("");setDateFilter("all");setStatus("all");}}>{t(locale,"reset")}</button></div>}
   </div>
  </div>;
}

type FileItem={id:string;file:File;error:string};
function NewRequestView({locale,requests,onCreate,editId,back}:{locale:Locale;requests:MeetingRequest[];onCreate:(r:MeetingRequest,isEdit:boolean)=>void;editId?:string;back:()=>void}){
 const record=requests.find(r=>r.id===editId);
 const [fullName]=useState(MOCK_USER);
 const [units,setUnits]=useState<string[]>(record?[record.unit]:[]);
 const [agenda,setAgenda]=useState(record?.agenda||"");
 const [participants,setParticipants]=useState(record?.participants||"");
 const [date,setDate]=useState(record?.preferredDate||todayIso());
 const [files,setFiles]=useState<FileItem[]>([]);
 const [errors,setErrors]=useState(false);
 const fileInput=useRef<HTMLInputElement>(null);
 const replaceIndex=useRef<string|null>(null);
 const fieldError=(value:boolean)=>errors&&value;
 const allowed=["pdf","doc","docx","xls","xlsx","ppt","pptx","jpg","jpeg","png","webp"];
 function validate(file:File):string{
  const ext=file.name.split(".").pop()?.toLowerCase()||"";
  if(file.size>4*1024*1024)return t(locale,"exceeds");
  if(!allowed.includes(ext))return t(locale,"unsupported");
  return "";
 }
 function handleFiles(event:ChangeEvent<HTMLInputElement>){
  const incoming=Array.from(event.target.files||[]);
  const replacement=replaceIndex.current;
  replaceIndex.current=null;
  if(replacement&&incoming.length){
   const f=incoming[0];setFiles(items=>items.map(item=>item.id===replacement?{id:item.id,file:f,error:validate(f)}:item));
  }else{
   setFiles(items=>{
    const available=Math.max(0,10-items.length-(record?.documents.length||0));
    if(incoming.length>available){setErrors(true);}
    return [...items,...incoming.slice(0,available).map((f,i)=>({id:String(Date.now())+"-"+i,file:f,error:validate(f)}))];
   });
  }
  event.target.value="";
 }
 function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setErrors(true);
  if(!units.length||!agenda.trim()||!participants.trim()||agenda.length>3000||participants.length>3000||!date||date<todayIso()||files.some(f=>f.error))return;
  const request:MeetingRequest={
   id:record?.id||("REQ-DEMO-"+Math.floor(Math.random()*9000+1000)),
   requester:fullName,unit:units.join(", "),agenda:agenda.trim(),participants:participants.trim(),
   preferredDate:date,status:record?(record.status==="ADJUSTED"?"PROCESSING":"REVISED_PROCESSING"):"PROCESSING",
   revisionTarget:null,updated:locale==="vi"?"Vừa xong":"Just now",documents:[...(record?.documents||[]),...files.map(x=>x.file.name)]
  };
  onCreate(request,Boolean(record));
 }
 return <div className="page-shell form-page">
  <button type="button" onClick={back} className="back-link"><ArrowLeftIcon/>{t(locale,"return")}</button>
  <div className="page-title-row"><div><SectionEyebrow>{record?t(locale,"edit"):t(locale,"newRequest")}</SectionEyebrow><h1 className="page-title">{record?t(locale,"edit"):t(locale,"formTitle")}</h1><p className="page-subtitle">{t(locale,"formSub")}</p></div></div>
  {record?.instruction&&<div className="form-revision"><ExclamationCircleIcon/><div><strong>{t(locale,"revisionHint")}</strong><p>{record.instruction}</p></div></div>}
  <form onSubmit={submit} noValidate className="request-form">
    <div className="form-section"><div className="form-section-header"><span className="number-tag">01</span><div><h2>{t(locale,"section1")}</h2><p>{t(locale,"infoNote")}</p></div></div><div className="field-grid">
      <label className="field-label">{t(locale,"fullName")}<input value={fullName} readOnly className="readonly-field" /></label>
      <label className="field-label">{t(locale,"email")}<input value={MOCK_EMAIL} readOnly className="readonly-field"/></label>
      <fieldset className="field-label full-span"><legend>{t(locale,"schoolUnit")} <span className="required-star">*</span></legend><div className={"unit-options "+(fieldError(!units.length)?"error-control":"")}>{UNITS.map(u=><label key={u} className={"unit-option "+(units.includes(u)?"unit-selected":"")}><input type="checkbox" checked={units.includes(u)} onChange={e=>setUnits(current=>e.target.checked?[...current,u]:current.filter(x=>x!==u))}/><span className="unit-check"><CheckIcon/></span>{u}</label>)}</div><span className="field-help">{t(locale,"unitHelp")}</span></fieldset>
    </div></div>
    <div className="form-section"><div className="form-section-header"><span className="number-tag">02</span><div><h2>{t(locale,"section2")}</h2><p>{t(locale,"formSub")}</p></div></div><div className="field-grid">
      <label className="field-label full-span">{t(locale,"agendaField")} <span className="required-star">*</span><textarea rows={4} className={fieldError(!agenda.trim()||agenda.length>3000)?"error-control":""} value={agenda} maxLength={3000} onChange={e=>setAgenda(e.target.value)} placeholder={locale==="vi"?"Mô tả mục tiêu, nội dung cần trao đổi...":"Summarize the objectives and talking points..."}/><span className="field-help field-counter">{agenda.length} / 3,000</span></label>
      <label className="field-label full-span">{t(locale,"participantsField")} <span className="required-star">*</span><textarea rows={3} className={fieldError(!participants.trim()||participants.length>3000)?"error-control":""} value={participants} maxLength={3000} onChange={e=>setParticipants(e.target.value)} placeholder={locale==="vi"?"Ví dụ: Ban Giám hiệu, đại diện các phòng ban...":"Example: University leadership, heads of offices..."}/><span className="field-help field-counter">{participants.length} / 3,000</span></label>
      <label className="field-label date-field">{t(locale,"preferredDate")} <span className="required-star">*</span><input type="date" min={todayIso()} value={date} onChange={e=>setDate(e.target.value)} className={fieldError(!date||date<todayIso())?"error-control":""}/><span className="field-help">{t(locale,"noTime")}</span></label>
    </div></div>
    <div className="form-section"><div className="form-section-header"><span className="number-tag">03</span><div><h2>{t(locale,"section3")}</h2><p>{t(locale,"attachNote")}</p></div></div>
      <input type="file" multiple className="visually-hidden" ref={fileInput} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp" onChange={handleFiles} aria-label={t(locale,"attach")}/>
      <button type="button" className="upload-zone" onClick={()=>fileInput.current?.click()}><span className="upload-icon"><PaperClipIcon/></span><strong>{t(locale,"attach")}</strong><small>{t(locale,"attachNote")}</small></button>
      {record?.documents.map(d=><div className="upload-item" key={d}><DocumentTextIcon/><strong>{d}</strong><span className="file-ready">{locale==="vi"?"Tệp hiện có":"Existing"}</span></div>)}
      {files.map(item=><div className={"upload-item "+(item.error?"upload-invalid":"")} key={item.id}><DocumentTextIcon/><div><strong>{item.file.name}</strong><small>{(item.file.size/1024/1024).toFixed(2)} MB · {item.error||t(locale,"uploaded")}</small></div>{item.error&&<button type="button" className="file-retry" onClick={()=>{replaceIndex.current=item.id;fileInput.current?.click();}}>{t(locale,"retry")}</button>}<button type="button" className="icon-button file-remove" aria-label={t(locale,"remove")} onClick={()=>setFiles(current=>current.filter(x=>x.id!==item.id))}><TrashIcon/></button></div>)}
      {errors&&files.length+(record?.documents.length||0)>=10&&<span className="inline-error">{t(locale,"maxFiles")}</span>}
    </div>
    {errors&&(!units.length||!agenda.trim()||!participants.trim()||!date||files.some(x=>x.error))&&<p role="alert" className="submit-error"><ExclamationCircleIcon/>{t(locale,"formError")}</p>}
    <div className="form-footer"><p><ShieldCheckIcon/>{t(locale,"policy")}</p><div><button type="button" onClick={back} className="button button-outline">{t(locale,"cancel")}</button><button type="submit" className="button button-primary">{record?t(locale,"resubmit"):t(locale,"submit")}<ArrowRightIcon className="icon-sm"/></button></div></div>
  </form>
 </div>;
}

function CalendarView({locale,requests,open}:{locale:Locale;requests:MeetingRequest[];open:(r:MeetingRequest)=>void}){
 const [month,setMonth]=useState(()=>new Date());
 const [selected,setSelected]=useState(todayIso());
 const m=month.getMonth(),y=month.getFullYear(),first=new Date(y,m,1),offset=(first.getDay()+6)%7;
 const days=Array.from({length:42},(_,i)=>new Date(y,m,i-offset+1));
 const scheduled=requests.filter(r=>r.status==="APPROVED"||r.status==="COMPLETED");
 function key(d:Date){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
 const label=new Intl.DateTimeFormat(locale==="vi"?"vi-VN":"en-US",{month:"long",year:"numeric"}).format(month);
 return <div className="page-shell">
  <div className="page-title-row"><div><SectionEyebrow>{t(locale,"scheduled")}</SectionEyebrow><h1 className="page-title">{t(locale,"calendarTitle")}</h1><p className="page-subtitle">{t(locale,"calendarSub")}</p></div><div className="calendar-month-nav"><button className="icon-button" type="button" aria-label="Previous month" onClick={()=>setMonth(new Date(y,m-1,1))}><ChevronLeftIcon/></button><span>{label}</span><button className="icon-button" type="button" aria-label="Next month" onClick={()=>setMonth(new Date(y,m+1,1))}><ChevronRightIcon/></button></div></div>
  <div className="calendar-layout"><section className="calendar-panel"><div className="calendar-panel-head"><div><span className="calendar-legend-dot"/>{t(locale,"legend")}</div><span className="result-counter">{scheduled.length} {t(locale,"scheduled").toLowerCase()}</span></div><div className="calendar-grid">{(locale==="vi"?["T2","T3","T4","T5","T6","T7","CN"]:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]).map(d=><div key={d} className="weekday">{d}</div>)}{days.map((d,i)=>{const id=key(d),meetings=scheduled.filter(x=>x.meetingDate===id);return <button type="button" key={i} className={"calendar-day "+(d.getMonth()!==m?"other-month ":"")+(id===todayIso()?"today-cell ":"")+(selected===id?"selected-cell":"")} onClick={()=>setSelected(id)}><span>{d.getDate()}</span>{meetings.slice(0,2).map(x=><span key={x.id} className="meeting-dot">{x.meetingTime||"09:00"} · {x.agenda}</span>)}{meetings.length>2&&<small>+{meetings.length-2}</small>}</button>})}</div></section>
  <aside className="calendar-aside"><SectionEyebrow>{t(locale,"upcoming")}</SectionEyebrow><h2>{friendlyDate(selected,locale)}</h2>{scheduled.filter(r=>r.meetingDate===selected).length?scheduled.filter(r=>r.meetingDate===selected).map(r=><button className="day-event" type="button" key={r.id} onClick={()=>open(r)}><div className="day-event-time">{r.meetingTime||"09:00"}</div><strong>{r.agenda}</strong><small><MapPinIcon/>{r.location||t(locale,"noOfficial")}</small><ArrowRightIcon className="icon-sm"/></button>):<div className="calendar-no-event"><CalendarDaysIcon/><p>{t(locale,"noneScheduled")}</p></div>}</aside></div>
 </div>;
}
function AdminView({locale}:{locale:Locale}){
 const items=[{icon:UserGroupIcon,title:t(locale,"staff"),description:locale==="vi"?"Tài khoản, vai trò và đơn vị":"Accounts, roles and units"},{icon:Cog6ToothIcon,title:t(locale,"catalogs"),description:locale==="vi"?"Loại cuộc họp, đơn vị, địa điểm":"Meeting types, units and locations"},{icon:ShieldCheckIcon,title:t(locale,"logs"),description:locale==="vi"?"Theo dõi các thay đổi hệ thống":"Trace important system changes"}];
 return <div className="page-shell"><div className="page-title-row"><div><SectionEyebrow>{t(locale,"settings")}</SectionEyebrow><h1 className="page-title">{t(locale,"adminTitle")}</h1><p className="page-subtitle">{t(locale,"adminSub")}</p></div></div><div className="admin-grid">{items.map(({icon:Icon,title,description})=><div className="admin-card" key={title}><span className="admin-icon"><Icon/></span><h2>{title}</h2><p>{description}</p><span className="admin-preview-tag">{t(locale,"preview")}</span></div>)}</div><div className="admin-message"><InformationCircleIcon/>{t(locale,"adminNote")}</div></div>;
}

export default function PreviewApp(){
 const {role,setRole,locale,setLocale,requests,setRequests,toast,setToast}=useDemo();
 const path=usePathname()||"/requests";
 const router=useRouter();
 const [sidebarOpen,setSidebarOpen]=useState(false);
 const [workspaceOpen,setWorkspaceOpen]=useState(false);
 const [selected,setSelected]=useState<MeetingRequest|null>(null);
 const [action,setAction]=useState<{kind:ActionKind;request:MeetingRequest}|null>(null);
 const selectedRecord=selected?requests.find(r=>r.id===selected.id)||null:null;
 const isForm=path.startsWith("/requests/new");
 useEffect(()=>{if(!toast)return;const id=window.setTimeout(()=>setToast(""),4500);return ()=>window.clearTimeout(id);},[toast,setToast]);
 useEffect(()=>{if(!selectedRecord)return;function onKey(e:KeyboardEvent){if(e.key==="Escape"){setSelected(null);setAction(null);}}window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);},[selectedRecord]);
 function navigate(next:string){setSelected(null);setSidebarOpen(false);setWorkspaceOpen(false);router.push(next);}
 function switchRole(next:Role){setRole(next);navigate(next==="ADMIN"?"/settings":"/requests");}
 function applyAction(note:string){
  if(!action)return;
  const {request,kind}=action;
  setRequests(prev=>prev.map(r=>{
   if(r.id!==request.id)return r;
   if(kind==="approve")return {...r,status:"APPROVED",revisionTarget:null,updated:locale==="vi"?"Vừa xong":"Just now"};
   if(kind==="leaderRevision")return {...r,status:"REVISED",revisionTarget:"ASSISTANT",note:note,updated:locale==="vi"?"Vừa xong":"Just now"};
   if(kind==="delegate")return {...r,status:r.status==="PROCESSING"?"ADJUSTED":"REVISED",revisionTarget:"REQUESTER",instruction:note,updated:locale==="vi"?"Vừa xong":"Just now"};
   return {...r,status:"PENDING_APPROVAL",revisionTarget:null,updated:locale==="vi"?"Vừa xong":"Just now"};
  }));
  setAction(null);setToast(t(locale,"successDemo"));
 }
 function createRequest(r:MeetingRequest,isEdit:boolean){setRequests(prev=>isEdit?prev.map(x=>x.id===r.id?r:x):[r,...prev]);navigate("/requests");setToast(t(locale,"formSaved"));}
 if(path==="/login")return <SignIn locale={locale} onLocaleChange={setLocale} enter={()=>navigate("/requests")}/>;
 const navItems=role==="REQUESTER"?[
  {href:"/requests",name:t(locale,"myRequests"),icon:ClipboardDocumentListIcon},
  {href:"/requests/new",name:t(locale,"newRequest"),icon:PlusIcon},
  {href:"/calendar",name:t(locale,"calendar"),icon:CalendarDaysIcon}
 ]:role==="ASSISTANT"?[
  {href:"/requests",name:t(locale,"workQueue"),icon:ClipboardDocumentListIcon},
  {href:"/calendar",name:t(locale,"calendar"),icon:CalendarDaysIcon}
 ]:role==="LEADER"?[
  {href:"/requests",name:t(locale,"leaderQueue"),icon:ClipboardDocumentListIcon},
  {href:"/calendar",name:t(locale,"calendar"),icon:CalendarDaysIcon}
 ]:[
  {href:"/settings",name:t(locale,"settings"),icon:Cog6ToothIcon},
  {href:"/requests",name:t(locale,"requestList"),icon:ClipboardDocumentListIcon},
  {href:"/calendar",name:t(locale,"calendar"),icon:CalendarDaysIcon}
 ];
 const pageLabel=isForm?t(locale,"newRequest"):path==="/calendar"?t(locale,"calendar"):path==="/settings"?t(locale,"settings"):role==="REQUESTER"?t(locale,"myRequests"):role==="ASSISTANT"?t(locale,"workQueue"):role==="LEADER"?t(locale,"leaderQueue"):t(locale,"requestList");
 return <div className="app-shell">
  {sidebarOpen&&<button type="button" className="sidebar-screen" aria-label={t(locale,"close")} onClick={()=>setSidebarOpen(false)}/>}
  <aside className={"sidebar "+(sidebarOpen?"sidebar-open":"")}>
    <div className="side-logo"><Logo/></div>
    <div className="side-product"><span className="side-product-title">UniCouncil <em>Scheduler</em></span><span className="side-product-sub">EIU · MEETING MANAGEMENT</span></div>
    <div className="workspace-wrap"><span className="side-heading">{t(locale,"workspace")}</span>
      <button type="button" className="workspace-trigger" aria-expanded={workspaceOpen} onClick={()=>setWorkspaceOpen(v=>!v)}><span className="workspace-icon"><UserCircleIcon/></span><span><strong>{t(locale,role)}</strong><small>{t(locale,"preview")}</small></span><ChevronDownIcon className="icon-sm"/></button>
      {workspaceOpen&&<div className="workspace-dropdown">{ROLES.map(r=><button type="button" key={r} className={r===role?"selected-workspace":""} onClick={()=>switchRole(r)}>{t(locale,r)}{r===role&&<CheckIcon className="icon-sm"/>}</button>)}</div>}
    </div>
    <nav className="side-nav" aria-label={t(locale,"nav")}><span className="side-heading">{t(locale,"nav")}</span>{navItems.map(({href,name,icon:Icon})=><button type="button" key={href} onClick={()=>navigate(href)} className={"nav-link "+(path===href||(href==="/requests"&&path.startsWith("/requests/")&&!isForm)?"nav-active":"")}><Icon/><span>{name}</span>{path===href&&<span className="nav-active-marker"/>}</button>)}</nav>
    <div className="side-bottom"><div className="side-help"><InformationCircleIcon/><div><strong>{t(locale,"demo")}</strong><p>{t(locale,"previewSub")}</p></div></div><button type="button" className="side-user" onClick={()=>navigate("/login")}><span className="avatar">MA</span><span><strong>{MOCK_USER}</strong><small>{MOCK_EMAIL}</small></span><ArrowRightOnRectangleIcon className="icon-sm"/></button></div>
  </aside>
  <div className="main-area"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-nav-toggle" type="button" onClick={()=>setSidebarOpen(true)} aria-label={t(locale,"nav")}><Bars3Icon/></button><span className="topbar-location">{t(locale,role)} <ChevronRightIcon/> <strong>{pageLabel}</strong></span></div><div className="topbar-right"><DemoNotice locale={locale}/><LanguageSwitch locale={locale} change={setLocale}/><button type="button" className="icon-button notification-button" aria-label={t(locale,"preview")} onClick={()=>setToast(t(locale,"loginNote"))}><BellIcon/></button><span className="topbar-avatar">MA</span></div></header>
   <main id="main-content" tabIndex={-1}>
    {isForm?<NewRequestView key={path} locale={locale} requests={requests} editId={path.split("/")[3]} onCreate={createRequest} back={()=>navigate("/requests")}/>:
      path==="/calendar"?<CalendarView locale={locale} requests={requests} open={setSelected}/>:
      path==="/settings"?<AdminView locale={locale}/>:
      <RequestsView role={role} locale={locale} requests={requests} open={setSelected} newRequest={()=>navigate("/requests/new")}/>}
   </main>
   <footer className="app-footer">© EIU · UniCouncil Scheduler <span>{t(locale,"demo")}</span></footer>
  </div>
  {selectedRecord&&<DetailDrawer request={selectedRecord} role={role} locale={locale} onClose={()=>setSelected(null)} onAction={(kind,request)=>setAction({kind,request})} onEdit={r=>navigate("/requests/new/"+r.id)}/>}
  {action&&<ActionModal key={action.kind+action.request.id} kind={action.kind} request={action.request} locale={locale} close={()=>setAction(null)} confirm={applyAction}/>}
  {toast&&<div className="toast" role="status"><CheckCircleIcon/>{toast}<button aria-label={t(locale,"close")} type="button" onClick={()=>setToast("")}><XMarkIcon/></button></div>}
 </div>;
}
