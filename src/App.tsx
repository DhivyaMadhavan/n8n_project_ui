import { useState } from 'react';
import { Loader2, Briefcase, Mail, FileText, Plus, X, AlertCircle } from 'lucide-react';

interface FormData {
  jobRole: string;
  difficultyLevel: 'easy' | 'medium' | 'hard' | '';
  objectiveQuestions: string;
  programmingQuestions: string;
  submitterEmail: string;
  recipientEmails: string[];
}

interface WorkflowResult {
  success: boolean;
  message: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    jobRole: '',
    difficultyLevel: '',
    objectiveQuestions: '',
    programmingQuestions: '',
    submitterEmail: '',
    recipientEmails: [''],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecipientEmailChange = (index: number, value: string) => {
    const newEmails = [...formData.recipientEmails];
    newEmails[index] = value;
    setFormData(prev => ({ ...prev, recipientEmails: newEmails }));
  };

  const addRecipientEmail = () => {
    setFormData(prev => ({ ...prev, recipientEmails: [...prev.recipientEmails, ''] }));
  };

  const removeRecipientEmail = (index: number) => {
    if (formData.recipientEmails.length > 1) {
      const newEmails = formData.recipientEmails.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, recipientEmails: newEmails }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setIsLoading(true);

    try {
      const validRecipientEmails = formData.recipientEmails.filter(email => email.trim() !== '');

      if (!formData.submitterEmail.trim()) {
        setResult({
          success: false,
          message: 'Please enter your email address'
        });
        return;
      }

      if (validRecipientEmails.length === 0) {
        setResult({
          success: false,
          message: 'Please provide at least one recipient email address'
        });
        return;
      }

      const payload = {
        jobRole: formData.jobRole,
        difficultyLevel: formData.difficultyLevel,
        objectiveQuestions: parseInt(formData.objectiveQuestions),
        programmingQuestions: parseInt(formData.programmingQuestions),
        submitterEmail: formData.submitterEmail,
        recipientEmails: validRecipientEmails,
        submittedAt: new Date().toISOString()
      };

      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

      if (!webhookUrl) {
        setResult({
          success: false,
          message: 'N8N webhook URL not configured. Please set VITE_N8N_WEBHOOK_URL in your .env file'
        });
        return;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setResult({
          success: false,
          message: 'Something went wrong. Please try again later.'
        });
        return;
      }

      const rawData = await response.json();
      const data = Array.isArray(rawData) ? rawData[0] : rawData;

      if (!data.success) {
        setResult({
          success: false,
          message: 'Something went wrong. Please try again later.'
        });
        return;
      }

      setResult({
        success: true,
        message: 'Mail sent successfully',
      });
    } catch (err) {
      setResult({
        success: false,
        message: 'Something went wrong. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      jobRole: '',
      difficultyLevel: '',
      objectiveQuestions: '',
      programmingQuestions: '',
      submitterEmail: '',
      recipientEmails: [''],
    });
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Interview Question Generator
            </h1>
            <p className="text-slate-600">
              Generate customized interview questions
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="jobRole" className="block text-sm font-semibold text-slate-700 mb-2">
                    Job Role
                  </label>
                  <input
                    type="text"
                    id="jobRole"
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g., Frontend Developer, Data Scientist"
                  />
                </div>

                <div>
                  <label htmlFor="difficultyLevel" className="block text-sm font-semibold text-slate-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    id="difficultyLevel"
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Select difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="objectiveQuestions" className="block text-sm font-semibold text-slate-700 mb-2">
                      No. of Objective Questions
                    </label>
                    <input
                      type="number"
                      id="objectiveQuestions"
                      name="objectiveQuestions"
                      value={formData.objectiveQuestions}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="e.g., 10"
                    />
                  </div>

                  <div>
                    <label htmlFor="programmingQuestions" className="block text-sm font-semibold text-slate-700 mb-2">
                      No. of Programming Questions
                    </label>
                    <input
                      type="number"
                      id="programmingQuestions"
                      name="programmingQuestions"
                      value={formData.programmingQuestions}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <label htmlFor="submitterEmail" className="block text-sm font-semibold text-slate-700 mb-2">
                      <Mail className="inline-block w-4 h-4 mr-1" />
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      id="submitterEmail"
                      name="submitterEmail"
                      value={formData.submitterEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                      placeholder="your@example.com"
                    />

                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Send Questions To
                    </label>
                    <p className="text-xs text-slate-600 mb-3">Recipients who will receive the generated questions via email</p>

                    <div className="space-y-3">
                      {formData.recipientEmails.map((email, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => handleRecipientEmailChange(index, e.target.value)}
                            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="recipient@example.com"
                          />
                          {formData.recipientEmails.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRecipientEmail(index)}
                              className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addRecipientEmail}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Recipient
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    'Generate Questions'
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                  result.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {result.success ? (
                    <FileText className="w-10 h-10 text-green-600" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {result.success ? 'Success!' : 'Error'}
                  </h2>
                  <p className="text-slate-600 text-lg">
                    {result.message}
                  </p>
                </div>

                <div className="space-y-4">
                  {result.success && (
                    <p className="text-slate-500 text-sm">
                      Interview questions have been generated and sent to all provided email addresses.
                    </p>
                  )}
                  <button
                    onClick={resetForm}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                  >
                    Generate Another Set
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-sm text-slate-500">
            <p>Questions will be sent to the provided email addresses</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
