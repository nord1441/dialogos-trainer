{{/*
アプリケーション名
*/}}
{{- define "dialogos-trainer.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
フルネーム
*/}}
{{- define "dialogos-trainer.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
共通ラベル
*/}}
{{- define "dialogos-trainer.labels" -}}
helm.sh/chart: {{ include "dialogos-trainer.name" . }}
{{ include "dialogos-trainer.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
セレクターラベル
*/}}
{{- define "dialogos-trainer.selectorLabels" -}}
app.kubernetes.io/name: {{ include "dialogos-trainer.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
