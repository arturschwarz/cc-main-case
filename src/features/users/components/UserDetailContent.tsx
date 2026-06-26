import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/ui/components';
import { spacing } from '@/ui/theme';

import type { User } from '../types';

export interface UserDetailContentProps {
  user: User;
}

/**
 * Presentational Detail fields for a User, grouped into themed cards. Pure props
 * in, no data fetching — trivially testable and reusable.
 */
export function UserDetailContent({ user }: UserDetailContentProps) {
  const { address, company } = user;

  return (
    <View style={styles.container}>
      <Section title="Contact">
        <Field label="Email" value={user.email} />
        <Field label="Phone" value={user.phone} />
        <Field label="Username" value={user.username} />
      </Section>

      <Section title="Personal">
        <Field label="Age" value={String(user.age)} />
        <Field label="Gender" value={user.gender} />
        <Field label="Birth date" value={user.birthDate} />
        <Field label="University" value={user.university} />
      </Section>

      <Section title="Company">
        <Field label="Title" value={company.title} />
        <Field label="Name" value={company.name} />
        <Field label="Department" value={company.department} />
      </Section>

      <Section title="Address">
        <Field label="Street" value={address.address} />
        <Field
          label="City"
          value={`${address.city}, ${address.state} ${address.postalCode}`}
        />
        <Field label="Country" value={address.country} />
      </Section>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card style={styles.section}>
      <Text variant="label" color="secondary" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text variant="caption" color="muted">
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    textTransform: 'uppercase',
  },
  field: {
    gap: spacing.xs,
  },
});
