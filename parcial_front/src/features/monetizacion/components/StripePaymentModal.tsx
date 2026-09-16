import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { monetizacionService, type Plan } from '../../../services/monetizacionService';

// Cargar la promesa de Stripe una sola vez a nivel de módulo con tu clave pública
const DEFAULT_STRIPE_PUB_KEY = 'pk_test_51RSOXrQWBMQRJ0V0QIhFxflDri3YnipXCAA1isZewFKhPAhv8XYv8VfDoDTVrVtAfWYv93Tjr7TOcLuhuxDBkyuy00kh4grvEn';
const stripePromise = loadStripe(DEFAULT_STRIPE_PUB_KEY);

interface StripeCheckoutFormProps {
  plan: Plan;
  onSuccess: () => void;
  onClose: () => void;
}

const CheckoutFormContent: React.FC<StripeCheckoutFormProps> = ({
  plan,
  onSuccess,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loadingIntent, setLoadingIntent] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    planNombre: string;
    isMock?: boolean;
  } | null>(null);

  // Campos alternativos de simulación cuando Stripe Elements está en modo mock de desarrollo
  const [mockCardNumber, setMockCardNumber] = useState<string>('4242 4242 4242 4242');
  const [mockExpiry, setMockExpiry] = useState<string>('12/30');
  const [mockCvc, setMockCvc] = useState<string>('123');

  useEffect(() => {
    const initIntent = async () => {
      try {
        setLoadingIntent(true);
        setErrorMessage(null);
        const data = await monetizacionService.createPaymentIntent(plan.id);
        setPaymentData(data);
      } catch (err: any) {
        console.error('Error al inicializar PaymentIntent en Stripe:', err);
        setErrorMessage(
          err.response?.data?.detail || 'Error al conectar con la pasarela de Stripe.'
        );
      } finally {
        setLoadingIntent(false);
      }
    };

    initIntent();
  }, [plan.id]);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      if (paymentData.isMock || !stripe || !elements) {
        // Simulación controlada en entorno de pruebas local
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const res = await monetizacionService.confirmStripePayment(
          paymentData.paymentIntentId,
          plan.id
        );
        setSuccessMessage(res.message || '✓ Pago de suscripción completado exitosamente.');
        setTimeout(() => {
          onSuccess();
        }, 1600);
      } else {
        // Procesamiento real con Stripe JS SDK e iFrame oficial
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('No se encontró el elemento de tarjeta de Stripe.');
        }

        const result = await stripe.confirmCardPayment(paymentData.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Pentester Titular',
            },
          },
        });

        if (result.error) {
          setErrorMessage(result.error.message || 'El pago fue rechazado por Stripe.');
        } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          const res = await monetizacionService.confirmStripePayment(
            result.paymentIntent.id,
            plan.id
          );
          setSuccessMessage(res.message || '✓ Pago procesado y boleta emitida correctamente.');
          setTimeout(() => {
            onSuccess();
          }, 1600);
        }
      }
    } catch (err: any) {
      console.error('Error en procesamiento de pago Stripe:', err);
      setErrorMessage(
        err.message || err.response?.data?.detail || 'Ocurrió un fallo en la transacción con Stripe.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleFillTestCard = () => {
    setMockCardNumber('4242 4242 4242 4242');
    setMockExpiry('12/30');
    setMockCvc('123');
  };

  const isRealStripeActive = paymentData && !paymentData.isMock && !!stripe;

  return (
    <form onSubmit={handleSubmitPayment} className="p-6 space-y-5 text-xs text-slate-700">
      {/* Resumen del Plan */}
      <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 border border-slate-800">
        <div className="flex justify-between items-center">
          <span className="font-extrabold text-sky-400 uppercase text-[10px] tracking-widest bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Resumen de Suscripción
          </span>
          <span className="text-[11px] font-bold text-slate-300">
            {plan.duracion_dias} Días Cobertura
          </span>
        </div>
        <div className="flex justify-between items-baseline pt-1">
          <h4 className="text-base font-bold text-white uppercase">{plan.nombre}</h4>
          <div className="text-right">
            <span className="text-xl font-black text-sky-400">${plan.tarifa_monto || '0.00'}</span>
            <span className="text-[10px] text-slate-400 font-bold ml-1">USD</span>
          </div>
        </div>
      </div>

      {loadingIntent ? (
        <div className="py-8 text-center text-slate-400 flex justify-center items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800"></div>
          <span>Conectando con servidores de Stripe API...</span>
        </div>
      ) : successMessage ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center space-y-2 animate-fade-in">
          <div className="text-2xl">🎉</div>
          <h4 className="font-bold text-sm text-emerald-900">{successMessage}</h4>
          <p className="text-[11px] text-emerald-700">
            Se ha emitido tu Boleta de Suscripción en el sistema. Redirigiendo a tu historial...
          </p>
        </div>
      ) : (
        <>
          {/* Mensajes de error */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex justify-between items-center">
              <span>⚠️ {errorMessage}</span>
            </div>
          )}

          {/* Formulario de Tarjeta */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                💳 {isRealStripeActive ? 'Ingresa los datos de tu Tarjeta (Stripe iFrame Oficial)' : 'Datos de Tarjeta (Stripe Test Sandbox)'}
              </label>
              {!isRealStripeActive && (
                <button
                  type="button"
                  className="text-[10px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                  onClick={handleFillTestCard}
                >
                  ⚡ Usar Tarjeta Test (4242...)
                </button>
              )}
            </div>

            {isRealStripeActive ? (
              /* iFrame Oficial de Stripe CardElement con detección dinámica de marca */
              <div className="p-3.5 border border-slate-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-blue-600 shadow-xs transition">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '14px',
                        color: '#0f172a',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        '::placeholder': {
                          color: '#94a3b8',
                        },
                      },
                      invalid: {
                        color: '#dc2626',
                      },
                    },
                    hidePostalCode: true,
                  }}
                />
              </div>
            ) : (
              /* Campos de simulador para cuando no hay conexión a Stripe en vivo */
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500">Número de Tarjeta</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 bg-white outline-none focus:border-blue-600"
                    placeholder="4242 4242 4242 4242"
                    value={mockCardNumber}
                    onChange={(e) => setMockCardNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500">Expiración (MM/AA)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 bg-white outline-none focus:border-blue-600"
                      placeholder="12/30"
                      value={mockExpiry}
                      onChange={(e) => setMockExpiry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500">CVC / CVC2</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 bg-white outline-none focus:border-blue-600"
                      placeholder="123"
                      value={mockCvc}
                      onChange={(e) => setMockCvc(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-900 flex items-center gap-2">
            <span>🔒</span>
            <span>
              {isRealStripeActive
                ? 'Conexión SSL encriptada directamente con servidores oficiales de Stripe. Tarjetas de prueba recomendadas: 4242 4242 4242 4242.'
                : 'Transacción encriptada a través de Stripe Sandbox. No se realizará ningún cargo real.'}
            </span>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
              onClick={onClose}
              disabled={processing}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer"
              disabled={processing || loadingIntent}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                  <span>Procesando Pago...</span>
                </>
              ) : (
                <span>💳 PAGAR ${plan.tarifa_monto} USD CON STRIPE</span>
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export const StripePaymentModal: React.FC<{
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ plan, isOpen, onClose, onSuccess }) => {
  if (!isOpen || !plan) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Pasarela de Pago Seguro Stripe</h3>
              <p className="text-[10px] text-sky-400 font-mono">Stripe API Live / Test Mode Conectado</p>
            </div>
          </div>
          <button
            className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg text-xs transition"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutFormContent plan={plan} onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
};
