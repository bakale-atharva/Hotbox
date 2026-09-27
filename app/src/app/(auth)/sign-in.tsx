import { useSignIn } from '@clerk/expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';
import { clerkMessage } from '@/utils/clerk-errors';

export default function SignInScreen() {
  const theme = useTheme();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const busy = fetchStatus === 'fetching';

  async function finish() {
    // Stack.Protected swaps to the app as soon as the session is active.
    const { error } = await signIn.finalize();
    if (error) setFormError(clerkMessage(error));
  }

  async function onSignIn() {
    setFormError(null);
    const { error } = await signIn.password({ emailAddress: emailAddress.trim(), password });
    if (error) {
      setFormError(errors.fields.identifier || errors.fields.password ? null : clerkMessage(error));
      return;
    }
    if (signIn.status === 'complete') {
      await finish();
    } else if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
      // New device or MFA: confirm with a code sent by email.
      const emailFactor = signIn.supportedSecondFactors?.find((f) => f.strategy === 'email_code');
      if (!emailFactor) {
        setFormError('This account needs a verification method this app does not support yet.');
        return;
      }
      const { error: sendError } = await signIn.mfa.sendEmailCode();
      if (sendError) setFormError(clerkMessage(sendError));
      else setNeedsCode(true);
    } else {
      setFormError('Sign-in could not be completed. Please try again.');
    }
  }

  async function onVerify() {
    setFormError(null);
    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
    if (error) {
      setFormError(errors.fields.code ? null : clerkMessage(error));
      return;
    }
    if (signIn.status === 'complete') await finish();
  }

  if (needsCode) {
    return (
      <AuthScreen title="Check your email" subtitle={`We sent a code to ${emailAddress.trim()}.`}>
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
        <Button label="Verify" loading={busy} disabled={code.trim().length < 4} onPress={onVerify} />
        <Button
          label="Use a different account"
          variant="ghost"
          size="md"
          onPress={() => {
            void signIn.reset();
            setNeedsCode(false);
            setCode('');
          }}
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title="Welcome back" subtitle="Sign in to order hot pizza to your door.">
      <TextField
        label="Email"
        value={emailAddress}
        onChangeText={setEmailAddress}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        error={errors.fields.identifier?.message}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        error={errors.fields.password?.message}
        onSubmitEditing={onSignIn}
      />
      {formError && <ErrorText>{formError}</ErrorText>}
      <Button
        label="Sign in"
        loading={busy}
        disabled={!emailAddress.trim() || !password}
        onPress={onSignIn}
      />
      <Text style={{ color: theme.textSecondary, textAlign: 'center', fontSize: 15 }}>
        New to Hotbox?{' '}
        <Link href="/sign-up" replace style={{ color: theme.primary, fontWeight: '700' }}>
          Create an account
        </Link>
      </Text>
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
