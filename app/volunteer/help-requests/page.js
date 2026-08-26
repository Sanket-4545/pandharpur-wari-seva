"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Container from "@/components/Container";
import LoadingButton from "@/components/LoadingButton";
import Toast from "@/components/Toast";
import { HeartHandshake, MapPin, Phone, Clock, RefreshCw, CheckCircle2, Navigation, AlertCircle } from "lucide-react";
import Link from "next/link";

const HI = ["\u{1F3E5}","\u{1F4A7}","\u{1F37D}\u{FE0F}","\u{1F9ED}","\u{1F50D}","\u{1F6A8}","\u{2753}"];
const HM = { Medical:0, Water:1, Food:2, Direction:3, "Lost/Separated":4, Emergency:5, Other:6 };

function fd(d){ if(!d)return""; try{return new Date(d).toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});}catch{return d;} }

function ActiveCard({r,onStart,onComplete,busy}){
  const{t}=useLanguage();
  const loc=r.location&&typeof r.location==="object"&&r.location.lat&&r.location.lng;
  const mu=loc?"https://www.google.com/maps?q="+r.location.lat+","+r.location.lng:null;
  const ic=HI[HM[r.helpType]]||"\u{2753}";
  const acc=r.status==="Accepted", ip=r.status==="In Progress";
  const bd=acc?"inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border flex-shrink-0 bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30":"inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border flex-shrink-0 bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
  return(<div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-primary/30 dark:border-primary/20 overflow-hidden shadow-premium mb-4">
    <div className="bg-gradient-to-r from-primary/5 to-amber-500/5 px-5 py-3 border-b border-slate-100 dark:border-gray-800"><div className="flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-primary" /><h3 className="font-heading text-base font-extrabold text-charcoal dark:text-white">{t("volunteer_help_requests.my_active_request")}</h3></div></div>
    <div className="p-5">
      <div className="flex items-start gap-3 mb-4"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xl flex-shrink-0">{ic}</div>
        <div className="flex-1 min-w-0"><h4 className="font-heading text-base font-extrabold text-charcoal dark:text-white">{r.helpType}</h4><p className="text-sm text-charcoal dark:text-white font-semibold mt-0.5">{r.fullName||"Unknown"}</p></div>
        <span className={bd}>{acc?t("volunteer_help_requests.status_accepted"):t("volunteer_help_requests.status_in_progress")}</span></div>
      {r.contactNumber&&<div className="flex items-center gap-2 mb-3"><Phone className="w-4 h-4 text-primary/70 flex-shrink-0" /><span className="text-sm font-semibold text-charcoal dark:text-white">{r.contactNumber}</span>
        <a href={"tel:"+r.contactNumber} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"><Phone className="w-3 h-3" />{t("volunteer_help_requests.call")}</a></div>}
      {r.message&&<p className="text-sm text-charcoal-light dark:text-gray-400 mb-3 italic bg-slate-50 dark:bg-gray-800/50 rounded-lg p-3">&ldquo;{r.message}&rdquo;</p>}
      <div className="space-y-2 border-t border-slate-100 dark:border-gray-800 pt-3 text-xs font-semibold text-charcoal-light dark:text-gray-400">
        {loc?<div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" /><span className="flex-1">{r.location.lat.toFixed(5)}, {r.location.lng.toFixed(5)}</span>
          <a href={mu} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors"><Navigation className="w-3 h-3" />{t("volunteer_help_requests.open_location")}</a></div>
        :<div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" /><span>{t("volunteer_help_requests.location_not_provided")}</span></div>}
        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-secondary/70 flex-shrink-0" /><span>{r.requestId} &middot; {fd(r.acceptedAt||r.createdAt)}</span></div></div>
      <div className="mt-5">
        {acc&&<LoadingButton onClick={()=>onStart(r.requestId)} loading={busy} variant="primary" className="w-full !py-3.5 text-sm">{t("volunteer_help_requests.start_helping")}</LoadingButton>}
        {ip&&<LoadingButton onClick={()=>onComplete(r.requestId)} loading={busy} variant="secondary" className="w-full !py-3.5 text-sm">{t("volunteer_help_requests.mark_completed")}</LoadingButton>}
      </div></div></div>);}

function PendingCard({r,onAccept,accepting}){
  const{t}=useLanguage();
  const loc=r.location&&typeof r.location==="object"&&r.location.lat&&r.location.lng;
  const mu=loc?"https://www.google.com/maps?q="+r.location.lat+","+r.location.lng:null;
  const ic=HI[HM[r.helpType]]||"\u{2753}";
  return(<div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300">
    <div className="p-5"><div className="flex items-start gap-3 mb-3"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xl flex-shrink-0">{ic}</div>
      <div className="flex-1 min-w-0"><h3 className="font-heading text-base font-extrabold text-charcoal dark:text-white">{r.helpType}</h3><p className="text-sm text-charcoal dark:text-white font-semibold mt-0.5">{r.fullName||"Unknown"}</p></div>
      <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 flex-shrink-0">{t("help_page.success_pending")}</span></div>
    {r.contactNumber&&<div className="flex items-center gap-2 mb-2"><Phone className="w-4 h-4 text-primary/70 flex-shrink-0" /><span className="text-sm font-semibold text-charcoal dark:text-white">{r.contactNumber}</span></div>}
    {r.message&&<p className="text-sm text-charcoal-light dark:text-gray-400 mb-3 italic">&ldquo;{r.message}&rdquo;</p>}
    <div className="space-y-2 border-t border-slate-50 dark:border-gray-800 pt-3 text-xs font-semibold text-charcoal-light dark:text-gray-400">
      {loc?<div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" /><span className="flex-1 truncate">{r.location.lat.toFixed(5)}, {r.location.lng.toFixed(5)}</span>
        <a href={mu} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors flex-shrink-0"><Navigation className="w-3 h-3" />{t("volunteer_help_requests.open_location")}</a></div>
      :<div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" /><span>{t("volunteer_help_requests.location_not_provided")}</span></div>}
      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-secondary/70 flex-shrink-0" /><span>{r.requestId} &middot; {fd(r.createdAt)}</span></div></div>
    <div className="mt-4"><LoadingButton onClick={()=>onAccept(r.requestId)} loading={accepting} variant="primary" className="w-full !py-3.5 text-sm">{t("volunteer_help_requests.accept_request")}</LoadingButton></div>
    </div></div>);}

function DoneCard({r}){
  const ic=HI[HM[r.helpType]]||"\u{2753}";
  return(<div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-4 opacity-75">
    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-lg flex-shrink-0">{ic}</div>
      <div className="flex-1 min-w-0"><p className="font-heading text-sm font-bold text-charcoal dark:text-white truncate">{r.helpType} &mdash; {r.fullName||"Unknown"}</p>
        <p className="text-xs text-charcoal-light dark:text-gray-400">{r.requestId} &middot; {fd(r.completedAt)}</p></div>
      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /></div></div>);}

export default function VolunteerHelpRequestsPage(){
  const{t}=useLanguage();
  const[pending,setPending]=useState([]);
  const[active,setActive]=useState([]);
  const[completed,setCompleted]=useState([]);
  const[loading,setLoading]=useState(true);
  const[refreshing,setRefreshing]=useState(false);
  const[error,setError]=useState(null);
  const[acceptingId,setAcceptingId]=useState(null);
  const[actionBusy,setActionBusy]=useState(false);
  const[toast,setToast]=useState({message:"",type:"success",visible:false});
  const showToast=useCallback((m,tp="success")=>setToast({message:m,type:tp,visible:true}),[]);

  const fetchAll=useCallback(async(refresh=false)=>{
    try{
      if(refresh)setRefreshing(true);else setLoading(true);
      setError(null);
      const[pR,aR,iR,cR]=await Promise.all([
        fetch("/api/volunteer/help-requests?status=Pending&limit=50"),
        fetch("/api/volunteer/help-requests?status=Accepted&mine=true&limit=10"),
        fetch("/api/volunteer/help-requests?status=In%20Progress&mine=true&limit=10"),
        fetch("/api/volunteer/help-requests?status=Completed&mine=true&limit=10"),
      ]);
      if(!pR.ok&&pR.status===401){setError(t("volunteer_help_requests.error_auth"));return;}
      if(!pR.ok&&pR.status===403){setError(t("volunteer_help_requests.error_deactivated"));return;}
      if(pR.ok){const j=await pR.json();setPending(j.data?.items||[]);}
      const ai=aR.ok?(await aR.json()).data?.items||[]:[];
      const ii=iR.ok?(await iR.json()).data?.items||[]:[];
      setActive([...ai,...ii]);
      if(cR.ok){const j=await cR.json();setCompleted(j.data?.items||[]);}
    }catch(err){console.error("Help requests fetch error:",err);setError(t("volunteer_help_requests.error_network"));}
    finally{setLoading(false);setRefreshing(false);}
  },[t]);

  useEffect(()=>{fetchAll();},[fetchAll]);

  const handleAccept=async(id)=>{
    setAcceptingId(id);
    try{
      const res=await fetch("/api/volunteer/help-requests/"+id+"/accept",{method:"PATCH"});
      if(res.ok){showToast(t("volunteer_help_requests.toast_accepted"));await fetchAll(true);}
      else{const j=await res.json().catch(()=>({}));
        if(res.status===409)showToast(t("volunteer_help_requests.error_already_accepted"),"error");
        else if(res.status===404)showToast(t("volunteer_help_requests.error_not_found"),"error");
        else showToast(j.error||t("volunteer_help_requests.toast_error"),"error");
        await fetchAll(true);}
    }catch{showToast(t("volunteer_help_requests.error_network"),"error");}
    finally{setAcceptingId(null);}
  };

  const handleStatus=async(id,status)=>{
    setActionBusy(true);
    try{
      const res=await fetch("/api/volunteer/help-requests/"+id+"/status",{
        method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status}),
      });
      if(res.ok){showToast(status==="In Progress"?t("volunteer_help_requests.toast_started"):t("volunteer_help_requests.toast_completed"));await fetchAll(true);}
      else{const j=await res.json().catch(()=>({}));
        if(res.status===403)showToast(t("volunteer_help_requests.error_owner"),"error");
        else if(res.status===400)showToast(t("volunteer_help_requests.error_invalid_transition"),"error");
        else showToast(j.error||t("volunteer_help_requests.toast_error"),"error");}
    }catch{showToast(t("volunteer_help_requests.error_network"),"error");}
    finally{setActionBusy(false);}
  };

  return(
    <div className="bg-slate-50 dark:bg-gray-950 min-h-screen pb-20">
      <section className="relative min-h-[30vh] md:min-h-[35vh] flex flex-col justify-center py-16 overflow-hidden bg-gradient-to-br from-red-500 to-rose-600">
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <Container className="relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-xs font-semibold mb-6">
            <Link href="/volunteer/dashboard" className="hover:text-white/80 transition-colors">{t("nav.home")}</Link>
            <span>/</span>
            <span className="font-bold">{t("volunteer_help_requests.title")}</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">{t("volunteer_help_requests.title")}</h1>
          <p className="mt-4 text-sm sm:text-base text-white/80 max-w-xl leading-relaxed mx-auto">{t("volunteer_help_requests.subtitle")}</p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white">{t("volunteer_help_requests.pending_requests")}</h2>
              <LoadingButton onClick={()=>fetchAll(true)} loading={refreshing} variant="outline" className="!px-4 !py-2 !text-xs">
                <RefreshCw className={"w-4 h-4 "+(refreshing?"animate-spin":"")} />{t("volunteer_help_requests.refresh")}
              </LoadingButton>
            </div>

            {error&&(<div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 mb-8">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-500 dark:text-red-400 font-semibold">{error}</p>
              <button onClick={()=>fetchAll(true)} className="mt-4 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all">{t("common.retry")}</button>
            </div>)}

            {!error&&active.length>0&&(<div className="mb-10">{active.map(r=>(<ActiveCard key={r.requestId||r._id} r={r} onStart={id=>handleStatus(id,"In Progress")} onComplete={id=>handleStatus(id,"Completed")} busy={actionBusy} />))}</div>)}

            {!error&&!loading&&active.length===0&&(<div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-8 text-center mb-8"><HeartHandshake className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" /><p className="text-sm text-charcoal-light dark:text-gray-400 font-semibold">{t("volunteer_help_requests.empty_active")}</p></div>)}

            {loading?(<div className="space-y-4">{[1,2,3].map(i=>(<div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 animate-pulse"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-slate-200 dark:bg-gray-700 rounded-xl" /><div className="flex-1 space-y-3"><div className="h-5 bg-slate-200 dark:bg-gray-700 rounded w-1/3" /><div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/2" /><div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-2/3" /></div></div></div>))}</div>)
            :!error&&pending.length===0?(<div className="text-center py-16 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-8 max-w-md mx-auto"><div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center"><HeartHandshake className="w-7 h-7 text-slate-400 dark:text-gray-500" /></div><p className="text-lg font-heading font-extrabold text-charcoal dark:text-white">{t("volunteer_help_requests.empty_pending")}</p><p className="text-sm text-charcoal-light dark:text-gray-400 mt-2">{t("volunteer_help_requests.empty_pending_desc")}</p><button onClick={()=>fetchAll(true)} className="mt-6 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all">{t("volunteer_help_requests.refresh")}</button></div>)
            :(<div className="space-y-4">{pending.map(r=>(<PendingCard key={r.requestId||r._id} r={r} onAccept={handleAccept} accepting={acceptingId===r.requestId} />))}</div>)}

            {!loading&&completed.length>0&&(<div className="mt-12"><h2 className="font-heading text-xl font-extrabold text-charcoal dark:text-white mb-6">{t("volunteer_help_requests.completed_today")}</h2><div className="space-y-3">{completed.map(r=>(<DoneCard key={r.requestId||r._id} r={r} />))}</div></div>)}

          </div>
        </Container>
      </section>

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={()=>setToast(prev=>({...prev,visible:false}))} duration={4000} />
    </div>
  );
}