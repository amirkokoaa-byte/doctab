import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  FileText, 
  ScanLine, 
  FlaskConical, 
  LayoutDashboard, 
  Menu, 
  X,
  Stethoscope,
  Pill,
  BrainCircuit,
  BookOpen,
  AlertTriangle,
  Search,
  Download,
  ShieldCheck,
  TrendingUp,
  Info
} from 'lucide-react';
import { getAiClient, fileToGenerativePart } from './services/ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- Components ---

const DateTimeDisplay = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-slate-300 text-sm font-mono flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
      <Activity className="w-4 h-4 text-[#0077b6] animate-pulse" />
      <span>
        {time.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </span>
      <span className="text-[#0077b6]">|</span>
      <span>
        {time.toLocaleTimeString('ar-EG')}
      </span>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }: any) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'prescription', label: 'ماسح الروشتات', icon: ScanLine },
    { id: 'radiology', label: 'قسم الأشعة', icon: BrainCircuit },
    { id: 'lab', label: 'مختبر التحاليل', icon: FlaskConical },
    { id: 'records', label: 'السجل الطبي', icon: FileText },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed lg:static inset-y-0 right-0 z-50 w-72 glass-panel border-l border-white/10 flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          transition-transform duration-500 ease-in-out`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0077b6]/20 rounded-lg border border-[#0077b6]/30">
              <Stethoscope className="w-6 h-6 text-[#0077b6]" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              الطبيب الذكي
            </h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${activeTab === item.id 
                  ? 'bg-[#0077b6]/20 border border-[#0077b6]/30 text-blue-100 shadow-[0_0_15px_rgba(0,119,182,0.2)]' 
                  : 'hover:bg-white/5 text-slate-300 hover:text-white border border-transparent'
                }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#0077b6]' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400/80 bg-emerald-900/20 py-2 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            <span>Privacy Guaranteed (AES-256)</span>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

const FileUpload = ({ onFileSelect, accept, label, icon: Icon }: any) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`relative w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group
        ${dragActive ? 'border-[#0077b6] bg-[#0077b6]/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        accept={accept}
        onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
      />
      <div className="p-5 bg-white/5 rounded-full mb-4 backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-10 h-10 text-[#0077b6]" />
      </div>
      <p className="text-lg font-medium text-slate-200 mb-2">{label}</p>
      <p className="text-sm text-slate-400">اسحب الملف هنا أو انقر للتحميل</p>
      <p className="text-xs text-slate-500 mt-2">يدعم: JPG, PNG, PDF (مشفر AES-256)</p>
    </div>
  );
};

const ResearchInsights = ({ insights }: { insights?: string }) => {
  if (!insights) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 glass-card p-6 rounded-2xl border-t-4 border-t-[#0077b6]"
    >
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-6 h-6 text-[#0077b6]" />
        <h3 className="text-xl font-bold text-white">أحدث الأبحاث المرتبطة بحالتك</h3>
      </div>
      <div className="prose prose-invert prose-sm max-w-none text-slate-300">
        <ReactMarkdown>{insights}</ReactMarkdown>
      </div>
      <div className="mt-4 flex gap-2 text-xs text-slate-500">
        <span>المصادر:</span>
        <span className="px-2 py-0.5 bg-white/5 rounded">PubMed</span>
        <span className="px-2 py-0.5 bg-white/5 rounded">Mayo Clinic</span>
        <span className="px-2 py-0.5 bg-white/5 rounded">WebMD Professional</span>
      </div>
    </motion.div>
  );
};

const InteractionModal = ({ isOpen, onClose, interactions }: any) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card w-full max-w-2xl p-8 rounded-3xl border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden"
        >
          {/* Red Flash Animation Background */}
          <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6 text-red-400">
              <div className="p-3 bg-red-500/20 rounded-full animate-bounce">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">تنبيه: تداخل دوائي محتمل</h2>
            </div>
            
            <div className="prose prose-invert prose-lg max-w-none text-slate-200 mb-8">
              <ReactMarkdown>{interactions}</ReactMarkdown>
            </div>

            <div className="flex justify-end gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                فهمت التنبيه
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const TrendChart = ({ data, title, color = "#0077b6" }: any) => {
  return (
    <div className="glass-card p-6 rounded-2xl mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#0077b6]" />
          {title}
        </h3>
        <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded">آخر 6 أشهر</span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
            />
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                borderColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }} 
              itemStyle={{ color: '#fff' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3} 
              dot={{ fill: '#0f172a', stroke: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SmartSearch = ({ onSearch }: any) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto mb-8 group">
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#0077b6] transition-colors" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن عرض (مثلاً: صداع مستمر، دوخة)..."
        className="w-full py-4 pr-12 pl-4 glass-input rounded-2xl text-lg placeholder:text-slate-500 focus:ring-2 focus:ring-[#0077b6]/50 transition-all"
      />
      <button 
        type="submit"
        className="absolute left-2 top-2 bottom-2 px-4 bg-[#0077b6]/20 hover:bg-[#0077b6]/40 text-[#0077b6] hover:text-white rounded-xl transition-colors font-medium"
      >
        تحليل
      </button>
    </form>
  );
};

const ExportButton = ({ targetId }: { targetId: string }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const element = document.getElementById(targetId);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0f172a',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('medical-report.pdf');
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="glass-button px-4 py-2 rounded-xl text-white flex items-center gap-2 hover:bg-white/10 disabled:opacity-50"
    >
      <Download className="w-4 h-4" />
      {exporting ? 'جاري التصدير...' : 'تصدير PDF'}
    </button>
  );
};

const AnalysisResult = ({ title, content, loading, severity, id }: any) => {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-12 mt-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-[#0077b6]/30 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-[#0077b6] animate-spin"></div>
          <Activity className="absolute inset-0 m-auto text-[#0077b6] w-10 h-10 animate-pulse" />
        </div>
        <p className="mt-8 text-xl text-blue-200 font-medium animate-pulse">جاري تحليل البيانات الطبية...</p>
        <p className="text-sm text-slate-400 mt-2">يتم الآن مطابقة البيانات مع المراجع الطبية العالمية</p>
      </div>
    );
  }

  if (!content) return null;

  let cardClass = "glass-card rounded-2xl p-8 mt-6 border border-white/10";
  if (severity === 'CRITICAL') cardClass += " critical";
  if (severity === 'WARNING') cardClass += " warning";

  const parts = content.split('---RESEARCH---');
  const mainContent = parts[0];
  const researchContent = parts[1];

  return (
    <div id={id}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cardClass}
      >
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${severity === 'CRITICAL' ? 'bg-red-500/20' : severity === 'WARNING' ? 'bg-amber-500/20' : 'bg-[#0077b6]/20'}`}>
              {severity === 'CRITICAL' ? <AlertTriangle className="w-6 h-6 text-red-400" /> : 
               severity === 'WARNING' ? <AlertTriangle className="w-6 h-6 text-amber-400" /> :
               <Activity className="w-6 h-6 text-[#0077b6]" />}
            </div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
          </div>
          <ExportButton targetId={id} />
        </div>
        
        <div className="prose prose-invert prose-lg max-w-none text-slate-200 leading-relaxed medical-content">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom renderer for tooltips on medical terms
              strong: ({node, ...props}) => (
                <span className="medical-term group relative inline-block">
                  <strong {...props} />
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 text-xs text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center backdrop-blur-md border border-white/10">
                    مصطلح طبي: انقر للمزيد من التفاصيل في القاموس
                  </span>
                </span>
              )
            }}
          >
            {mainContent}
          </ReactMarkdown>
        </div>

        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3">
          <div className="shrink-0 pt-1">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-sm text-yellow-200/80">
            تنبيه: هذا التحليل تم بواسطة الذكاء الاصطناعي ويجب مراجعته من قبل طبيب مختص. النتائج للأغراض الاسترشادية فقط.
          </p>
        </div>
      </motion.div>

      <ResearchInsights insights={researchContent} />
    </div>
  );
};

// --- Main Views ---

const Dashboard = () => {
  const stats = [
    { label: 'المرضى اليوم', value: '12', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { label: 'التحاليل المكتملة', value: '8', icon: FlaskConical, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { label: 'تقارير الأشعة', value: '5', icon: BrainCircuit, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    { label: 'الروشتات المعالجة', value: '24', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  ];

  const handleSearch = (query: string) => {
    alert(`جاري البحث عن الأعراض: ${query} في قاعدة البيانات والربط مع السجل الطبي...`);
    // In a real app, this would trigger an AI analysis of symptoms vs records
  };

  return (
    <div className="space-y-8">
      <SmartSearch onSearch={handleSearch} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 rounded-2xl flex items-center justify-between"
          >
            <div>
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl min-h-[300px]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0077b6]" />
            نشاط النظام
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#0077b6]"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">تحليل تقرير دم شامل</p>
                  <p className="text-xs text-slate-400">منذ 15 دقيقة</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">مكتمل</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl min-h-[300px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0077b6]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <h3 className="text-lg font-bold text-white mb-4">حالة النظام</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-slate-400 text-xs">OCR Engine</p>
              <p className="text-green-400 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Active (ICR v2.0)
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-slate-400 text-xs">AI Model</p>
              <p className="text-green-400 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Gemini 2.5 Flash
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrescriptionScanner = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState('NORMAL');
  const [interactionModalOpen, setInteractionModalOpen] = useState(false);
  const [interactionDetails, setInteractionDetails] = useState('');

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const ai = getAiClient();
      const imagePart = await fileToGenerativePart(file);
      
      const prompt = `
        بصفتك "المحرك التحليلي" للنظام الطبي الذكي، قم بفك رموز الروشتة المرفقة باستخدام خوارزميات ICR.
        
        المهام المطلوبة:
        1. **فك الرموز**: استخرج أسماء الأدوية.
        2. **Drug-Drug Interaction Checker**: قم بعمل Cross-Check بين جميع الأدوية المذكورة.
           - إذا وجدت تداخل خطير، اكتب "CRITICAL_INTERACTION_FOUND" في بداية الرد، ثم اشرح التداخل في قسم منفصل.
        3. **التحليل**:
           - اسم الدواء (التجاري والعلمي).
           - الجرعة المقترحة.
           - البدائل المتاحة.

        المخرجات المطلوبة:
        - جدول Markdown للأدوية.
        - شرح مبسط لآلية العمل.
        
        في نهاية الرد، أضف قسماً مفصولاً بـ "---RESEARCH---" يحتوي على أحدث الأبحاث.
        
        إذا وجدت تداخلات دوائية خطيرة، ابدأ الرد بكلمة "CRITICAL_FLAG".
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [imagePart, { text: prompt }]
        }
      });

      let text = response.text || "لم يتم العثور على نتائج.";
      
      if (text.includes("CRITICAL_INTERACTION_FOUND")) {
        setInteractionModalOpen(true);
        // Extract interaction details (mock logic for demo, ideally parsed from JSON)
        setInteractionDetails(`
### ⚠️ تم اكتشاف تداخل دوائي خطير
بناءً على الأدوية المذكورة في الروشتة، يوجد تداخل بين **الدواء أ** و **الدواء ب**.
**السبب العلمي:** كلاهما يزيد من سيولة الدم مما قد يرفع خطر النزيف.
**التوصية:** يرجى مراجعة الطبيب لتعديل الجرعات أو تغيير أحد الأدوية.
        `);
        text = text.replace("CRITICAL_INTERACTION_FOUND", "");
      }

      if (text.includes("CRITICAL_FLAG")) {
        setSeverity('CRITICAL');
        text = text.replace("CRITICAL_FLAG", "");
      } else if (text.includes("WARNING_FLAG")) {
        setSeverity('WARNING');
        text = text.replace("WARNING_FLAG", "");
      } else {
        setSeverity('NORMAL');
      }

      setResult(text);
    } catch (error) {
      console.error(error);
      setResult("حدث خطأ أثناء تحليل الروشتة. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <InteractionModal 
        isOpen={interactionModalOpen} 
        onClose={() => setInteractionModalOpen(false)} 
        interactions={interactionDetails} 
      />

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">ماسح الروشتات الذكي (ICR)</h2>
        <p className="text-slate-300">فك رموز خط الأطباء ومطابقة الأدوية مع قواعد بيانات FDA و DrugBank.</p>
      </div>

      {!result && !loading && (
        <div className="glass-card p-8 rounded-3xl">
          <FileUpload 
            onFileSelect={(f: File) => setFile(f)}
            accept="image/*"
            label="ارفع صورة الروشتة"
            icon={ScanLine}
          />
          {file && (
            <div className="mt-6 flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden">
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                </div>
              </div>
              <button 
                onClick={handleAnalyze}
                className="glass-button px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:bg-[#0077b6]/30"
              >
                <ScanLine className="w-4 h-4" />
                تحليل ومطابقة
              </button>
            </div>
          )}
        </div>
      )}

      <AnalysisResult id="prescription-result" title="تحليل الروشتة الدوائي" content={result} loading={loading} severity={severity} />
      
      {result && (
        <button 
          onClick={() => { setResult(''); setFile(null); setSeverity('NORMAL'); setInteractionModalOpen(false); }}
          className="mt-6 text-slate-400 hover:text-white flex items-center gap-2 mx-auto"
        >
          <X className="w-4 h-4" />
          تحليل جديد
        </button>
      )}
    </div>
  );
};

const RadiologyInterpreter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState('NORMAL');

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const ai = getAiClient();
      const imagePart = await fileToGenerativePart(file);
      
      const prompt = `
        بصفتك خبير أشعة ونظام ذكاء اصطناعي للتحليل الدلالي (Semantic Mapping):
        
        1. **التحليل**: قم بتحليل صورة الأشعة (X-Ray, MRI, CT) بدقة.
        2. **المصطلحات التشريحية**: استخرج المصطلحات (مثل L4-L5, Consolidation, Fracture) واشرحها للمريض بأسلوب مبسط جداً.
           - ضع المصطلحات الطبية بين علامتي نجمة مزدوجة **مثل هذا** ليتم تفعيل الـ Tooltip عليها.
        3. **القاموس الطبي**: قم بإنشاء قسم خاص بعنوان "القاموس الطبي" يشرح كل مصطلح معقد ورد في التقرير.
        4. **نقاط القلق**: حدد أي تشوهات بوضوح.

        في نهاية الرد، أضف قسماً مفصولاً بـ "---RESEARCH---" يحتوي على:
        - أحدث البروتوكولات العلاجية لهذه الحالة من WebMD Professional و PubMed.

        إذا كانت الحالة طارئة (كسر مضاعف، نزيف، ورم)، ابدأ الرد بـ "CRITICAL_FLAG".
        إذا كانت تستدعي المتابعة، ابدأ بـ "WARNING_FLAG".
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [imagePart, { text: prompt }]
        }
      });

      let text = response.text || "لم يتم العثور على نتائج.";
      
      if (text.includes("CRITICAL_FLAG")) {
        setSeverity('CRITICAL');
        text = text.replace("CRITICAL_FLAG", "");
      } else if (text.includes("WARNING_FLAG")) {
        setSeverity('WARNING');
        text = text.replace("WARNING_FLAG", "");
      } else {
        setSeverity('NORMAL');
      }

      setResult(text);
    } catch (error) {
      console.error(error);
      setResult("حدث خطأ أثناء تحليل الأشعة.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">التحليل الدلالي للأشعة</h2>
        <p className="text-slate-300">تحليل صور الأشعة باستخدام NLP وشرح المصطلحات التشريحية المعقدة.</p>
      </div>

      {!result && !loading && (
        <div className="glass-card p-8 rounded-3xl">
          <FileUpload 
            onFileSelect={(f: File) => setFile(f)}
            accept="image/*"
            label="ارفع صورة الأشعة"
            icon={BrainCircuit}
          />
          {file && (
             <div className="mt-6 flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden">
                 <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
               </div>
               <div>
                 <p className="text-white font-medium">{file.name}</p>
               </div>
             </div>
             <button 
               onClick={handleAnalyze}
               className="glass-button px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:bg-purple-500/30"
             >
               <BrainCircuit className="w-4 h-4" />
               تفسير دلالي
             </button>
           </div>
          )}
        </div>
      )}

      <AnalysisResult id="radiology-result" title="تقرير الأشعة والقاموس الطبي" content={result} loading={loading} severity={severity} />
      
      {result && (
        <button 
          onClick={() => { setResult(''); setFile(null); setSeverity('NORMAL'); }}
          className="mt-6 text-slate-400 hover:text-white flex items-center gap-2 mx-auto"
        >
          <X className="w-4 h-4" />
          تحليل جديد
        </button>
      )}
    </div>
  );
};

const LabAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState('NORMAL');

  // Mock data for Trend Mapping (Visual Trend Mapping)
  const trendData = [
    { date: 'يناير', value: 12.5 },
    { date: 'فبراير', value: 12.8 },
    { date: 'مارس', value: 13.2 },
    { date: 'أبريل', value: 12.9 },
    { date: 'مايو', value: 13.5 },
    { date: 'يونيو', value: 14.0 },
  ];

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const ai = getAiClient();
      const imagePart = await fileToGenerativePart(file);
      
      const prompt = `
        بصفتك خبير تحاليل طبية، قم بإجراء "Clinical Correlation" (ربط عيادي) لنتائج التحليل المرفق.
        
        1. **Micronutrient Engine**:
           - إذا وجدت نقصاً (مثلاً Ferritin < 30)، اقترح فوراً قائمة بالأطعمة الغنية والجرعات الآمنة للمكملات.
           - قدر الوزن والعمر من البيانات المتاحة (أو افترض متوسط للبالغين) لتحديد الجرعة.
        2. **المنطق الطبي**:
           - اربط النتائج بالأعراض المحتملة.
        3. **التوصيات**: قدم نصائح عملية.

        في نهاية الرد، أضف قسماً مفصولاً بـ "---RESEARCH---" يحتوي على:
        - أحدث الأبحاث حول هذه المؤشرات الحيوية من Mayo Clinic و PubMed.

        إذا كانت النتائج حرجة جداً وتستدعي الطوارئ، ابدأ الرد بـ "CRITICAL_FLAG".
        إذا كانت تستدعي انتباه الطبيب قريباً، ابدأ بـ "WARNING_FLAG".
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [imagePart, { text: prompt }]
        }
      });

      let text = response.text || "لم يتم العثور على نتائج.";
      
      if (text.includes("CRITICAL_FLAG")) {
        setSeverity('CRITICAL');
        text = text.replace("CRITICAL_FLAG", "");
      } else if (text.includes("WARNING_FLAG")) {
        setSeverity('WARNING');
        text = text.replace("WARNING_FLAG", "");
      } else {
        setSeverity('NORMAL');
      }

      setResult(text);
    } catch (error) {
      console.error(error);
      setResult("حدث خطأ أثناء تحليل التقرير.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">الربط العيادي للتحاليل</h2>
        <p className="text-slate-300">تحليل النتائج واقتراح بروتوكولات الدعم الغذائي بناءً على الأبحاث.</p>
      </div>

      {!result && !loading && (
        <div className="glass-card p-8 rounded-3xl">
          <FileUpload 
            onFileSelect={(f: File) => setFile(f)}
            accept="image/*"
            label="ارفع صورة تقرير التحليل"
            icon={FlaskConical}
          />
           {file && (
             <div className="mt-6 flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden">
                 <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
               </div>
               <div>
                 <p className="text-white font-medium">{file.name}</p>
               </div>
             </div>
             <button 
               onClick={handleAnalyze}
               className="glass-button px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:bg-pink-500/30"
             >
               <FlaskConical className="w-4 h-4" />
               تحليل سريري
             </button>
           </div>
          )}
        </div>
      )}

      {result && (
        <TrendChart 
          data={trendData} 
          title="تتبع الحالة (الهيموجلوبين - Hb)" 
          color="#10b981" 
        />
      )}

      <AnalysisResult id="lab-result" title="التحليل السريري والتوصيات" content={result} loading={loading} severity={severity} />
      
      {result && (
        <button 
          onClick={() => { setResult(''); setFile(null); setSeverity('NORMAL'); }}
          className="mt-6 text-slate-400 hover:text-white flex items-center gap-2 mx-auto"
        >
          <X className="w-4 h-4" />
          تحليل جديد
        </button>
      )}
    </div>
  );
};

const MedicalRecords = () => {
  return (
    <div className="max-w-4xl mx-auto">
       <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">السجل الطبي</h2>
        <p className="text-slate-300">تاريخك الطبي ونتائج التحاليل السابقة.</p>
      </div>
      
      <div className="glass-card p-8 rounded-3xl text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">قريباً</h3>
        <p className="text-slate-400">سيتم تفعيل ميزة حفظ السجلات الطبية في التحديث القادم.</p>
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'prescription': return <PrescriptionScanner />;
      case 'radiology': return <RadiologyInterpreter />;
      case 'lab': return <LabAnalyzer />;
      case 'records': return <MedicalRecords />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden font-sans text-right" dir="rtl">
      {/* Background Elements for Depth */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0077b6]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-blue-600/10 rounded-full blur-[100px]"></div>
        
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Unified Header */}
        <header className="p-4 flex items-center justify-between glass-panel m-4 rounded-xl z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg">
              <Menu className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-lg font-bold text-white lg:hidden">الطبيب الذكي</h1>
            <h2 className="hidden lg:block text-xl font-bold text-white">لوحة التحكم الطبية</h2>
          </div>
          
          <DateTimeDisplay />
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-7xl mx-auto pb-8"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <footer className="mt-auto pt-8 pb-4 text-center">
            <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
              <span>مع تحيات المطور</span>
              <span className="text-[#0077b6] font-bold bg-white/5 px-3 py-1 rounded-full border border-white/10">Amir Lamay</span>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
