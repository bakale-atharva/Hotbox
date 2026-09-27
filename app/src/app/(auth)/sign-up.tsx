import { useSignUp } from '@clerk/expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import { clerkMessage } from '@/utils/clerk-errors';

/** Keep in sync with Clerk Dashboard → User & authentication → Password. */
const MIN_PASSWORD_LENGTH = 8;

export default function SignUpScreen() {
  const theme = useTheme();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  // Only move to the code step once a code has actually been sent. Clerk's
  // sign-up resource reports the email as unverified as soon as it's
  // created, even when the password was rejected, so it can't drive the UI.
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const busy = fetchStatus === 'fetching';

  async function onSignUp() {
    setFormError(null);
    const { error } = await signUp.password({ emailAddress: emailAddress.trim(), password });
    if (error) {
      // Field errors (e.g. password too short) render under their inputs.
      setFormError(errors.fields.emailAddress || errors.fields.password ? null : clerkMessage(error));
      return;
    }
    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setFormError(clerkMessage(sendError));
      return;
    }
    setCode('');
    setStep('verify');
  }

  async function onVerify() {
    setFormError(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (error) {
      setFormError(errors.fields.code ? null : clerkMessage(error));
      return;
    }
    if (signUp.status === 'complete') {
      // Stack.Protected swaps to the app as soon as the session is active.
      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) setFormError(clerkMessage(finalizeError));
    } else {
      setFormError('Your account needs more details to finish. Please start again.');
    }
  }

  function startOver() {
    void signUp.reset();
    setStep('details');
    setCode('');
    setFormError(null);
  }

  if (step === 'verify') {
    return (
      <AuthScreen title="Verify your email" subtitle={`Enter the code we sent to ${emailAddress.trim()}.`}>
        <TextField
          label="Verification code"
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          error={errors.fields.code?.message}
          onSubmitEditing={onVerify}
        />
        {formError && <ErrorText>{formError}</ErrorText>}
        <Button label="Verify and continue" loading={busy} disabled={code.trim().length < 4} onPress={onVerify} />
        <Button
          label="Resend code"
          variant="ghost"
          size="md"
          disabled={busy}
          onPress={async () => {
            const { error } = await signUp.verifications.sendEmailCode();
            setFormError(error ? clerkMessage(error) : null);
          }}
        />
        <Button
          label="Back · use a different email"
          variant="ghost"
          size="md"
          icon={{ sf: 'chevron.left', md: 'arrow_back' }}
          disabled={busy}
          onPress={startOver}
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title="Create your account" subtitle="Order in seconds and track your pizza live.">
      <TextField
        label="Email"
        value={emailAddress}
        onChangeText={setEmailAddress}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        error={errors.fields.emailAddress?.message}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        // Mirrors the Clerk instance's minimum length; Clerk still enforces
        // it (plus breached-password checks) and its message wins.
        error={errors.fields.password?.message}
        hint={
          password.length > 0 && password.length < MIN_PASSWORD_LENGTH
            ? `${MIN_PASSWORD_LENGTH - password.length} more character${MIN_PASSWORD_LENGTH - password.length === 1 ? '' : 's'} needed`
            : undefined
        }
        onSubmitEditing={onSignUp}
      />
      {formError && <ErrorText>{formError}</ErrorText>}
      <Button
        label="Create account"
        loading={busy}
        disabled={!emailAddress.trim() || password.length < MIN_PASSWORD_LENGTH}
        onPress={onSignUp}
      />
      <Text style={{ color: theme.textSecondary, textAlign: 'center', fontSize: 15 }}>
        Already have an account?{' '}
        <Link href="/sign-in" replace style={{ color: theme.primary, fontWeight: '700' }}>
          Sign in
        </Link>
      </Text>
      {/* Required for sign-up on Expo web; Clerk skips the browser CAPTCHA on iOS and Android. */}
      <View nativeID="clerk-captcha" />
    </AuthScreen>
  );
}

function ErrorText({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text selectable style={{ color: theme.destructive, fontSize: 14, textAlign: 'center' }}>
      {children}
    </Text>
  );
}
