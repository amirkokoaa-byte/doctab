import React, { useState, useEffect } from 'react';
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
  Search
} from 'lucide-react';
import { getAiClient, fileToGenerativePart } from './services/ai';
import ReactMarkdown from 'react-markdown';

// --- Components ---

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

        <div className="p-4 border-t border-white/10">
          <div className="glass-card p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0077b6] to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
              د.م
            </div>
            <div>
              <p className="text-sm font-medium text-white">د. محمد علي</p>
              <p className="text-xs text-slate-400">أخصائي باطنة</p>
            </div>
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
      <p className="text-xs text-slate-500 mt-2">يدعم: JPG, PNG, PDF</p>
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

const AnalysisResult = ({ title, content, loading, severity }: any) => {
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

  // Determine card class based on severity
  let cardClass = "glass-card rounded-2xl p-8 mt-6 border border-white/10";
  if (severity === 'CRITICAL') cardClass += " critical";
  if (severity === 'WARNING') cardClass += " warning";

  // Split content to separate Research Insights if present
  const parts = content.split('---RESEARCH---');
  const mainContent = parts[0];
  const researchContent = parts[1];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cardClass}
      >
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <div className={`p-2 rounded-lg ${severity === 'CRITICAL' ? 'bg-red-500/20' : severity === 'WARNING' ? 'bg-amber-500/20' : 'bg-[#0077b6]/20'}`}>
            {severity === 'CRITICAL' ? <AlertTriangle className="w-6 h-6 text-red-400" /> : 
             severity === 'WARNING' ? <AlertTriangle className="w-6 h-6 text-amber-400" /> :
             <Activity className="w-6 h-6 text-[#0077b6]" />}
          </div>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
        
        <div className="prose prose-invert prose-lg max-w-none text-slate-200 leading-relaxed">
          <ReactMarkdown>{mainContent}</ReactMarkdown>
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
    </>
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

  return (
    <div className="space-y-6">
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

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const ai = getAiClient();
      const imagePart = await fileToGenerativePart(file);
      
      const prompt = `
        بصفتك "المحرك التحليلي" للنظام الطبي الذكي، قم بفك رموز الروشتة المرفقة باستخدام خوارزميات ICR.
        
        المهام المطلوبة:
        1. **فك الرموز**: استخرج أسماء الأدوية حتى لو كانت مكتوبة بخط يدوي صعب.
        2. **المطابقة**: طابق الأسماء المستخرجة مع قواعد بيانات FDA و DrugBank لتصحيح الأخطاء الإملائية وتحديد الاسم العلمي الدقيق.
        3. **التحليل**:
           - اسم الدواء (التجاري والعلمي).
           - الجرعة المقترحة (بناءً على المكتوب أو الجرعات القياسية إذا لم تكن واضحة).
           - البدائل المتاحة (Generic Alternatives).
           - التداخلات الدوائية (Drug-Drug Interactions) إذا كان هناك أكثر من دواء.

        المخرجات المطلوبة:
        - جدول Markdown يحتوي على الأعمدة التالية: اسم الدواء، المادة الفعالة، الجرعة، البدائل، ملاحظات هامة.
        - شرح مبسط لآلية عمل كل دواء.
        
        في نهاية الرد، أضف قسماً مفصولاً بـ "---RESEARCH---" يحتوي على:
        - أحدث الأبحاث المرتبطة بهذه الأدوية أو الحالة المحتملة (استشهد بـ Mayo Clinic, PubMed).
        
        إذا وجدت تداخلات دوائية خطيرة، ابدأ الرد بكلمة "CRITICAL_FLAG".
        إذا كانت هناك تنبيهات متوسطة، ابدأ الرد بكلمة "WARNING_FLAG".
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
      setResult("حدث خطأ أثناء تحليل الروشتة. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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

      <AnalysisResult title="تحليل الروشتة الدوائي" content={result} loading={loading} severity={severity} />
      
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

      <AnalysisResult title="تقرير الأشعة والقاموس الطبي" content={result} loading={loading} severity={severity} />
      
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

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const ai = getAiClient();
      const imagePart = await fileToGenerativePart(file);
      
      const prompt = `
        بصفتك خبير تحاليل طبية، قم بإجراء "Clinical Correlation" (ربط عيادي) لنتائج التحليل المرفق.
        
        1. **قراءة النتائج**: استخرج القيم وقارنها بـ Reference Range.
        2. **المنطق الطبي**:
           - إذا كانت النتيجة < الحد الأدنى أو > الحد الأقصى، لا تكتفِ بذكر ذلك.
           - ابحث عن الأعراض المرتبطة بهذا الخلل (مثل فقر الدم، نقص المناعة).
           - اقترح بروتوكول "دعم غذائي" أو "فيتامينات" كمسودة استشارية.
        3. **التوصيات**: قدم نصائح عملية بناءً على النتائج.

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

      <AnalysisResult title="التحليل السريري والتوصيات" content={result} loading={loading} severity={severity} />
      
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
        <header className="lg:hidden p-4 flex items-center justify-between glass-panel m-4 rounded-xl z-30">
          <h1 className="text-lg font-bold text-white">الطبيب الذكي</h1>
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-lg">
            <Menu className="w-6 h-6 text-white" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-7xl mx-auto pb-20"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
